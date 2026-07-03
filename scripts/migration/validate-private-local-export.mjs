import { readFile } from 'fs/promises';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const SCRIPT_FILE = fileURLToPath(import.meta.url);
const SCRIPT_NAME = path.basename(SCRIPT_FILE);

const EXIT_CODES = Object.freeze({
  PASS: 0,
  'NO-GO': 1,
  CHECK: 2,
  BLOCKED: 3,
  ABORTED: 4,
  INVALID_USAGE: 5,
});

const EXPECTED_COLLECTIONS = Object.freeze([
  'monthlyLetters',
  'openWhenLetters',
  'reasons',
  'promises',
  'importantDates',
  'futureDreams',
  'timeline',
  'blackHoleGallery',
  'playlist',
]);

const ALLOWED_AUTHORS = new Set([
  'local-yori',
  'local-ale',
  'local-owner_a',
  'local-owner_b',
  'owner_a',
  'owner_b',
  'partner_a',
  'partner_b',
  'external_user',
  'system',
  'mock',
]);

const SECRET_PATTERNS = Object.freeze([
  { code: 'supabase_url', pattern: /https?:\/\/[a-z0-9-]+\.supabase\.co/i },
  { code: 'project_ref_like', pattern: /\b[a-z0-9]{20}\b/ },
  { code: 'publishable_or_secret_key', pattern: /\bsb_(publishable|secret)_[A-Za-z0-9_-]{16,}\b/ },
  { code: 'jwt_like_token', pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/ },
  { code: 'service_role_value', pattern: /"(service[_-]?role|service-role)"\s*:\s*"(?!<)[^"]{6,}"/i },
  { code: 'password_value', pattern: /"password"\s*:\s*"(?!<)[^"]{3,}"/i },
  { code: 'uuid_value', pattern: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b/ },
  { code: 'personal_email', pattern: /\b[A-Za-z0-9._%+-]+@(?!example\.invalid\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
  { code: 'private_absolute_path', pattern: /([A-Za-z]:\\Users\\[^\s"'<>]+|\/Users\/[^\s"'<>]+|\/home\/[^\s"'<>]+)/ },
  { code: 'access_or_refresh_token', pattern: /"?(access_token|refresh_token)"?\s*:/i },
  { code: 'api_key_value', pattern: /"(api[_-]?key|client[_-]?secret|secret[_-]?key)"\s*:\s*"(?!<)[A-Za-z0-9._-]{12,}"/i },
  { code: 'oauth_token_value', pattern: /"(oauth[_-]?token|oauth[_-]?access[_-]?token)"\s*:\s*"(?!<)[A-Za-z0-9._-]{12,}"/i },
]);

const DATA_URL_PATTERN = /data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/gi;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const HUMAN_DATE_WITH_YEAR_PATTERN = /\b\d{1,2}\s+de\s+[a-záéíóúñ]+\s+de\s+\d{4}\b/i;
const HUMAN_DATE_WITHOUT_YEAR_PATTERN = /\b\d{1,2}\s+de\s+[a-záéíóúñ]+\b/i;

function usage() {
  return [
    `Usage: node scripts/migration/${SCRIPT_NAME} <local-export-v2.json>`,
    'Input must be an explicit local JSON file. Remote URLs are rejected.',
  ];
}

function isRemoteInput(value) {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function sanitizePathForOutput(resolvedPath) {
  const relativePath = path.relative(process.cwd(), resolvedPath);
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return '<outside-repository>';
  }
  return relativePath.split(path.sep).join('/');
}

function addIssue(list, code, message, ref = undefined) {
  list.push({ code, message, ref });
}

function scanForSecrets(rawText) {
  const findings = [];
  for (const check of SECRET_PATTERNS) {
    if (check.pattern.test(rawText)) {
      findings.push({
        code: check.code,
        message: `Sensitive pattern detected: ${check.code}`,
      });
    }
  }
  return findings;
}

function countDataUrls(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  const matches = text.match(DATA_URL_PATTERN);
  return matches ? matches.length : 0;
}

function isValidIsoDate(value) {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function hasItemId(item) {
  return ['id', 'localId', 'legacyId'].some((key) => {
    return typeof item[key] === 'string' || typeof item[key] === 'number';
  });
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasBodyContent(item) {
  if (Array.isArray(item.content) && item.content.length > 0) return true;
  if (Array.isArray(item.paragraphs) && item.paragraphs.length > 0) return true;
  if (hasText(item.body)) return true;
  if (hasText(item.text)) return true;
  if (hasText(item.description)) return true;
  return false;
}

function getCollectionItems(exportJson, collection) {
  const items = exportJson.content?.[collection];
  return Array.isArray(items) ? items : [];
}

function getTotalItems(exportJson) {
  return EXPECTED_COLLECTIONS.reduce((total, collection) => {
    return total + getCollectionItems(exportJson, collection).length;
  }, 0);
}

function buildCollectionCounts(exportJson) {
  const counts = {};
  for (const collection of EXPECTED_COLLECTIONS) {
    counts[collection] = getCollectionItems(exportJson, collection).length;
  }
  return counts;
}

function validateRequiredBlocks(exportJson, errors) {
  if (!isPlainObject(exportJson)) {
    addIssue(errors, 'top_level_not_object', 'Export JSON must be an object.');
    return;
  }

  if (Number(exportJson.version) !== 2) {
    addIssue(errors, 'version_incompatible', 'Export version must be compatible with v2.');
  }

  if (!hasText(exportJson.exportedAt)) {
    addIssue(errors, 'exported_at_missing', '`exportedAt` is required.');
  }

  if (!isPlainObject(exportJson.content)) {
    addIssue(errors, 'content_missing', '`content` must be an object.');
  }

  if (!isPlainObject(exportJson.overrides)) {
    addIssue(errors, 'overrides_missing', '`overrides` must be an object.');
  }

  if (!isPlainObject(exportJson.hidden)) {
    addIssue(errors, 'hidden_missing', '`hidden` must be an object.');
  }
}

function validateCollectionBlocks(exportJson, errors) {
  if (!isPlainObject(exportJson.content)) return;

  for (const collection of EXPECTED_COLLECTIONS) {
    if (!Array.isArray(exportJson.content[collection])) {
      addIssue(errors, 'content_collection_missing', `content.${collection} must be an array.`, collection);
    }
  }

  if (isPlainObject(exportJson.overrides)) {
    for (const collection of EXPECTED_COLLECTIONS) {
      if (!isPlainObject(exportJson.overrides[collection])) {
        addIssue(errors, 'overrides_collection_invalid', `overrides.${collection} must be an object.`, collection);
      }
    }
  }

  if (isPlainObject(exportJson.hidden)) {
    for (const collection of EXPECTED_COLLECTIONS) {
      if (!Array.isArray(exportJson.hidden[collection])) {
        addIssue(errors, 'hidden_collection_invalid', `hidden.${collection} must be an array.`, collection);
      }
    }
  }
}

function validateIdentity(item, warnings, ref) {
  for (const key of ['createdBy', 'updatedBy']) {
    if (!hasText(item[key])) {
      addIssue(warnings, 'identity_missing', `${key} is missing.`, ref);
      continue;
    }
    if (!ALLOWED_AUTHORS.has(item[key])) {
      addIssue(warnings, 'identity_unknown', `${key} is not a known local synthetic identity.`, ref);
    }
  }
}

function validateLetter(item, errors, warnings, ref) {
  if (!hasItemId(item)) addIssue(errors, 'letter_id_missing', 'Letter item needs id/localId/legacyId.', ref);
  if (!hasText(item.title)) addIssue(errors, 'letter_title_missing', 'Letter item needs title.', ref);
  if (!hasBodyContent(item)) addIssue(errors, 'letter_content_missing', 'Letter item needs content/body/paragraphs.', ref);
  validateIdentity(item, warnings, ref);
}

function validateSimpleTextItem(item, errors, warnings, ref, label) {
  if (!hasItemId(item)) addIssue(errors, `${label}_id_missing`, `${label} item needs id/localId/legacyId.`, ref);
  if (!hasText(item.title)) addIssue(errors, `${label}_title_missing`, `${label} item needs title.`, ref);
  if (!hasBodyContent(item)) addIssue(errors, `${label}_content_missing`, `${label} item needs text or description.`, ref);
  validateIdentity(item, warnings, ref);
}

function validateImportantDate(item, errors, warnings, ref) {
  if (!hasItemId(item)) addIssue(errors, 'important_date_id_missing', 'Important date needs id/localId/legacyId.', ref);
  if (!hasText(item.title)) addIssue(errors, 'important_date_title_missing', 'Important date needs title.', ref);
  if (!hasText(item.date)) {
    addIssue(errors, 'important_date_date_missing', 'Important date needs date.', ref);
  } else if (!isValidIsoDate(item.date)) {
    addIssue(warnings, 'important_date_legacy_date', 'Important date uses legacy or human date format.', ref);
  }
  validateIdentity(item, warnings, ref);
}

function validateFutureDream(item, errors, warnings, ref) {
  if (!hasItemId(item)) addIssue(errors, 'future_dream_id_missing', 'Future dream needs id/localId/legacyId.', ref);
  if (!hasText(item.title)) addIssue(errors, 'future_dream_title_missing', 'Future dream needs title.', ref);
  if (!hasBodyContent(item)) addIssue(errors, 'future_dream_description_missing', 'Future dream needs description.', ref);
  validateIdentity(item, warnings, ref);
}

function validateTimelineDate(value, errors, warnings, ref) {
  if (!hasText(value)) {
    addIssue(errors, 'timeline_date_missing', 'Timeline item needs date.', ref);
    return;
  }

  if (isValidIsoDate(value)) return;

  if (HUMAN_DATE_WITH_YEAR_PATTERN.test(value)) {
    addIssue(warnings, 'timeline_date_not_iso', 'Timeline date has a year but is not YYYY-MM-DD.', ref);
    return;
  }

  if (HUMAN_DATE_WITHOUT_YEAR_PATTERN.test(value)) {
    addIssue(warnings, 'timeline_date_without_year', 'Timeline date has no year.', ref);
    return;
  }

  addIssue(errors, 'timeline_date_invalid', 'Timeline date is invalid.', ref);
}

function validateTimeline(item, errors, warnings, ref) {
  if (!hasItemId(item)) addIssue(errors, 'timeline_id_missing', 'Timeline item needs id/localId/legacyId.', ref);
  if (!hasText(item.title)) addIssue(errors, 'timeline_title_missing', 'Timeline item needs title.', ref);
  if (!hasBodyContent(item)) addIssue(errors, 'timeline_description_missing', 'Timeline item needs description.', ref);
  validateTimelineDate(item.date, errors, warnings, ref);
  if ('details' in item && !Array.isArray(item.details)) {
    addIssue(errors, 'timeline_details_not_array', 'Timeline details must be an array when present.', ref);
  }
  validateIdentity(item, warnings, ref);
}

function validateBlackHoleItem(item, errors, warnings, ref) {
  if (!hasItemId(item)) addIssue(errors, 'black_hole_id_missing', 'Gallery item needs id/localId/legacyId.', ref);
  if (!hasText(item.title)) addIssue(errors, 'black_hole_title_missing', 'Gallery item needs title.', ref);
  if (!hasBodyContent(item)) addIssue(errors, 'black_hole_description_missing', 'Gallery item needs description.', ref);
  validateIdentity(item, warnings, ref);
}

function validatePlaylistItem(item, errors, warnings, ref) {
  if (!hasItemId(item)) addIssue(errors, 'playlist_id_missing', 'Playlist item needs id/localId/legacyId.', ref);
  if (!hasText(item.title)) addIssue(errors, 'playlist_title_missing', 'Playlist item needs title.', ref);
  if (!hasBodyContent(item)) addIssue(errors, 'playlist_description_missing', 'Playlist item needs description.', ref);
  if (hasText(item.link) || hasText(item.src)) {
    addIssue(warnings, 'playlist_link_or_path_present', 'Playlist item contains a link or path; value redacted.', ref);
  }
  validateIdentity(item, warnings, ref);
}

function validateContent(exportJson, errors, warnings) {
  const validators = {
    monthlyLetters: validateLetter,
    openWhenLetters: validateLetter,
    reasons: (item, e, w, ref) => validateSimpleTextItem(item, e, w, ref, 'reason'),
    promises: (item, e, w, ref) => validateSimpleTextItem(item, e, w, ref, 'promise'),
    importantDates: validateImportantDate,
    futureDreams: validateFutureDream,
    timeline: validateTimeline,
    blackHoleGallery: validateBlackHoleItem,
    playlist: validatePlaylistItem,
  };

  for (const collection of EXPECTED_COLLECTIONS) {
    const items = getCollectionItems(exportJson, collection);
    items.forEach((item, index) => {
      const ref = `${collection}[${index}]`;
      if (!isPlainObject(item)) {
        addIssue(errors, 'content_item_invalid', 'Content item must be an object.', ref);
        return;
      }
      validators[collection](item, errors, warnings, ref);
    });
  }
}

function validateCoverage(exportJson, warnings) {
  const totalItems = getTotalItems(exportJson);
  if (totalItems === 0) {
    addIssue(warnings, 'export_empty', 'Export has no content items.');
    return;
  }

  for (const collection of EXPECTED_COLLECTIONS) {
    if (getCollectionItems(exportJson, collection).length === 0) {
      addIssue(warnings, 'collection_empty', `content.${collection} is empty.`, collection);
    }
  }
}

function summarizeWarnings(warnings) {
  return warnings.slice(0, 12).map((warning) => {
    return {
      code: warning.code,
      ref: warning.ref || '<export>',
    };
  });
}

function summarizeErrors(errors) {
  return errors.slice(0, 12).map((error) => {
    return {
      code: error.code,
      ref: error.ref || '<export>',
    };
  });
}

function classify(errors, warnings) {
  if (errors.length > 0) return 'NO-GO';
  if (warnings.length > 0) return 'CHECK';
  return 'PASS';
}

function getNextRecommendedAction(status) {
  if (status === 'PASS') return 'review_sanitized_summary_before_private_next_phase';
  if (status === 'CHECK') return 'review_warnings_before_any_private_dry_run';
  if (status === 'NO-GO') return 'repair_export_or_validator_input_before_next_phase';
  if (status === 'BLOCKED') return 'resolve_format_or_decision_before_next_phase';
  return 'stop_and_remove_sensitive_input';
}

function printUsage(exitCode) {
  console.log('Private local export validation');
  console.log(`script: ${SCRIPT_NAME}`);
  console.log('validationStatus: INVALID_USAGE');
  for (const line of usage()) {
    console.log(line);
  }
  console.log(`exit code: ${exitCode}`);
}

function printReport({
  inputFile,
  validationStatus,
  version,
  collectionCounts,
  totalItems,
  dataUrlCount,
  mediaRequiresStorageLater,
  warnings,
  errors,
  exitCode,
}) {
  console.log('Private local export validation');
  console.log(`script: ${SCRIPT_NAME}`);
  console.log(`input file: ${inputFile}`);
  console.log(`validationStatus: ${validationStatus}`);
  console.log(`version: ${version}`);
  console.log(`collection counts: ${JSON.stringify(collectionCounts)}`);
  console.log(`totalItems: ${totalItems}`);
  console.log(`dataUrlCount: ${dataUrlCount}`);
  console.log(`mediaRequiresStorageLater: ${mediaRequiresStorageLater ? 'yes' : 'no'}`);
  console.log(`warnings count: ${warnings.length}`);
  console.log(`errors count: ${errors.length}`);
  console.log(`noGoReasons count: ${errors.length}`);
  console.log(`nextRecommendedAction: ${getNextRecommendedAction(validationStatus)}`);

  if (warnings.length > 0) {
    console.log(`warnings sanitized: ${JSON.stringify(summarizeWarnings(warnings))}`);
  }

  if (errors.length > 0) {
    console.log(`errors sanitized: ${JSON.stringify(summarizeErrors(errors))}`);
  }

  console.log(`exit code: ${exitCode}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    const exitCode = EXIT_CODES.INVALID_USAGE;
    printUsage(exitCode);
    process.exitCode = exitCode;
    return;
  }

  const input = args[0];
  if (isRemoteInput(input)) {
    const exitCode = EXIT_CODES.INVALID_USAGE;
    printReport({
      inputFile: '<remote-input-rejected>',
      validationStatus: 'INVALID_USAGE',
      version: '<unknown>',
      collectionCounts: {},
      totalItems: 0,
      dataUrlCount: 0,
      mediaRequiresStorageLater: false,
      warnings: [],
      errors: [{ code: 'remote_input_rejected', message: 'Remote URLs are not accepted.' }],
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  if (input.includes('.env.local')) {
    const exitCode = EXIT_CODES.ABORTED;
    printReport({
      inputFile: '<env-file-rejected>',
      validationStatus: 'ABORTED',
      version: '<unknown>',
      collectionCounts: {},
      totalItems: 0,
      dataUrlCount: 0,
      mediaRequiresStorageLater: false,
      warnings: [],
      errors: [{ code: 'env_file_rejected', message: '.env.local input is forbidden.' }],
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  const resolvedPath = path.resolve(process.cwd(), input);
  const safeFile = sanitizePathForOutput(resolvedPath);

  let rawText;
  try {
    rawText = await readFile(resolvedPath, 'utf8');
  } catch {
    const exitCode = EXIT_CODES.INVALID_USAGE;
    printReport({
      inputFile: safeFile,
      validationStatus: 'INVALID_USAGE',
      version: '<unknown>',
      collectionCounts: {},
      totalItems: 0,
      dataUrlCount: 0,
      mediaRequiresStorageLater: false,
      warnings: [],
      errors: [{ code: 'file_unreadable', message: 'Input file cannot be read.' }],
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  const securityFindings = scanForSecrets(rawText);
  if (securityFindings.length > 0) {
    const exitCode = EXIT_CODES.ABORTED;
    printReport({
      inputFile: safeFile,
      validationStatus: 'ABORTED',
      version: '<unknown>',
      collectionCounts: {},
      totalItems: 0,
      dataUrlCount: 0,
      mediaRequiresStorageLater: false,
      warnings: [],
      errors: securityFindings,
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  let exportJson;
  try {
    exportJson = JSON.parse(rawText);
  } catch {
    const exitCode = EXIT_CODES.INVALID_USAGE;
    printReport({
      inputFile: safeFile,
      validationStatus: 'INVALID_USAGE',
      version: '<invalid-json>',
      collectionCounts: {},
      totalItems: 0,
      dataUrlCount: 0,
      mediaRequiresStorageLater: false,
      warnings: [],
      errors: [{ code: 'invalid_json', message: 'Input is not valid JSON.' }],
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  const errors = [];
  const warnings = [];
  validateRequiredBlocks(exportJson, errors);
  validateCollectionBlocks(exportJson, errors);

  if (errors.length === 0) {
    validateContent(exportJson, errors, warnings);
    validateCoverage(exportJson, warnings);
  }

  const dataUrlCount = countDataUrls(exportJson);
  if (dataUrlCount > 0) {
    addIssue(warnings, 'data_url_detected', 'Embedded media detected; values redacted.', '<export>');
  }

  const validationStatus = classify(errors, warnings);
  const exitCode = EXIT_CODES[validationStatus];

  printReport({
    inputFile: safeFile,
    validationStatus,
    version: Number(exportJson?.version) === 2 ? '2' : String(exportJson?.version ?? '<missing>'),
    collectionCounts: buildCollectionCounts(exportJson),
    totalItems: getTotalItems(exportJson),
    dataUrlCount,
    mediaRequiresStorageLater: dataUrlCount > 0,
    warnings,
    errors,
    exitCode,
  });

  process.exitCode = exitCode;
}

await main();
