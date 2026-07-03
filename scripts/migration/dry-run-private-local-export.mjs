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

const COLLECTION_TYPE_MAP = Object.freeze({
  monthlyLetters: 'monthly_letter',
  openWhenLetters: 'open_when_letter',
  reasons: 'reason',
  promises: 'promise',
  importantDates: 'important_date',
  futureDreams: 'future_dream',
  timeline: 'timeline_event',
  blackHoleGallery: 'gallery_item',
  playlist: 'playlist_item',
});

const ALLOWED_IDENTITIES = new Set([
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
const HUMAN_DATE_WITH_YEAR_PATTERN = /^\d{1,2}\s+\p{L}+(?:\s+\p{L}+)?\s+\d{4}$/u;
const HUMAN_DATE_WITHOUT_YEAR_PATTERN = /^\d{1,2}\s+\p{L}+(?:\s+\p{L}+)?$/u;

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

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function sanitizePathForOutput(resolvedPath) {
  const relativePath = path.relative(process.cwd(), resolvedPath);
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return '<outside-repository>';
  }
  return relativePath.split(path.sep).join('/');
}

function addIssue(list, code, message, ref = '<export>') {
  list.push({ code, message, ref });
}

function scanForSecrets(rawText) {
  const findings = [];
  for (const check of SECRET_PATTERNS) {
    if (check.pattern.test(rawText)) {
      findings.push({
        code: check.code,
        message: `Sensitive pattern detected: ${check.code}`,
        ref: '<export>',
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

function getLocalRef(item, collection, index) {
  for (const key of ['id', 'localId', 'legacyId']) {
    const value = item?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return `${collection}[${index}]`;
}

function sanitizeLocalRef(value) {
  const text = String(value ?? '<unknown>').trim();
  if (!text) return '<unknown>';
  if (text.length > 80) return `${text.slice(0, 77)}...`;
  return text.replace(/[^\w:.[\]-]/g, '_');
}

function getItemTitle(item) {
  return hasText(item?.title) ? item.title.trim().toLowerCase() : '';
}

function hasBodyContent(item) {
  if (Array.isArray(item?.content) && item.content.length > 0) return true;
  if (Array.isArray(item?.paragraphs) && item.paragraphs.length > 0) return true;
  if (hasText(item?.body)) return true;
  if (hasText(item?.text)) return true;
  if (hasText(item?.description)) return true;
  return false;
}

function hasPlaylistSource(item) {
  return ['link', 'src', 'path', 'url'].some((key) => hasText(item?.[key]));
}

function hasMediaSource(item) {
  return ['image', 'src', 'path', 'url'].some((key) => {
    const value = item?.[key];
    if (!hasText(value)) return false;
    if (DATA_URL_PATTERN.test(value)) {
      DATA_URL_PATTERN.lastIndex = 0;
      return true;
    }
    DATA_URL_PATTERN.lastIndex = 0;
    return /^https?:\/\//i.test(value) || /[\\/]/.test(value);
  });
}

function validateRequiredBlocks(exportJson, errors) {
  if (!isPlainObject(exportJson)) {
    addIssue(errors, 'top_level_not_object', 'Export JSON must be an object.');
    return;
  }

  if (Number(exportJson.version) !== 2) {
    addIssue(errors, 'version_incompatible', 'Export version must be v2.');
  }

  if (!isPlainObject(exportJson.content)) {
    addIssue(errors, 'content_missing', '`content` must be an object.');
    return;
  }

  for (const collection of EXPECTED_COLLECTIONS) {
    if (!Array.isArray(exportJson.content[collection])) {
      addIssue(errors, 'content_collection_missing', `content.${collection} must be an array.`, collection);
    }
  }
}

function validateIdentity(item, warnings, ref) {
  for (const key of ['createdBy', 'updatedBy']) {
    if (!hasText(item[key])) {
      addIssue(warnings, 'identity_missing', `${key} is missing.`, ref);
      continue;
    }
    if (!ALLOWED_IDENTITIES.has(item[key])) {
      addIssue(warnings, 'identity_unknown', `${key} is not a known local identity label.`, ref);
    }
  }
}

function validateTimelineDate(value, errors, warnings, ref) {
  if (!hasText(value)) {
    addIssue(errors, 'timeline_date_missing', 'Timeline item needs a date.', ref);
    return;
  }

  if (isValidIsoDate(value)) return;

  if (HUMAN_DATE_WITH_YEAR_PATTERN.test(value.trim())) {
    addIssue(warnings, 'timeline_date_not_iso', 'Timeline date has a year but is not YYYY-MM-DD.', ref);
    return;
  }

  if (HUMAN_DATE_WITHOUT_YEAR_PATTERN.test(value.trim())) {
    addIssue(warnings, 'timeline_date_without_year', 'Timeline date has no year.', ref);
    return;
  }

  addIssue(errors, 'timeline_date_invalid', 'Timeline date is invalid.', ref);
}

function validateItem(collection, item, index, errors, warnings) {
  const ref = `${collection}[${index}]`;
  if (!isPlainObject(item)) {
    addIssue(errors, 'content_item_invalid', 'Content item must be an object.', ref);
    return;
  }

  const hasAnyId = ['id', 'localId', 'legacyId'].some((key) => {
    return hasText(item[key]) || typeof item[key] === 'number';
  });
  if (!hasAnyId) {
    addIssue(errors, 'local_ref_missing', 'Content item needs id/localId/legacyId.', ref);
  }

  if (!hasText(item.title)) {
    addIssue(errors, 'title_missing', 'Content item needs a title.', ref);
  }

  if (!hasBodyContent(item) && !['importantDates'].includes(collection)) {
    addIssue(errors, 'body_missing', 'Content item needs text, description, body or content.', ref);
  }

  validateIdentity(item, warnings, ref);

  if (collection === 'importantDates') {
    if (!hasText(item.date)) {
      addIssue(errors, 'important_date_missing', 'Important date item needs a date.', ref);
    } else if (!isValidIsoDate(item.date)) {
      addIssue(warnings, 'important_date_legacy_date', 'Important date is not YYYY-MM-DD.', ref);
    }
  }

  if (collection === 'timeline') {
    validateTimelineDate(item.date, errors, warnings, ref);
    if ('details' in item && !Array.isArray(item.details)) {
      addIssue(errors, 'timeline_details_not_array', 'Timeline details must be an array when present.', ref);
    }
  }

  if (collection === 'blackHoleGallery' && (countDataUrls(item) > 0 || hasMediaSource(item))) {
    addIssue(warnings, 'media_pending_storage', 'Gallery item has media that requires future Storage review.', ref);
  }

  if (collection === 'playlist' && hasPlaylistSource(item)) {
    addIssue(warnings, 'playlist_source_pending_review', 'Playlist item has a link or path; value redacted.', ref);
  }
}

function validateContent(exportJson, errors, warnings) {
  for (const collection of EXPECTED_COLLECTIONS) {
    getCollectionItems(exportJson, collection).forEach((item, index) => {
      validateItem(collection, item, index, errors, warnings);
    });
  }
}

function detectDuplicateCandidates(exportJson, warnings) {
  const localRefs = new Map();

  for (const collection of EXPECTED_COLLECTIONS) {
    const titles = new Map();
    const dateTitles = new Map();
    getCollectionItems(exportJson, collection).forEach((item, index) => {
      if (!isPlainObject(item)) return;
      const ref = `${collection}[${index}]`;
      const localRef = sanitizeLocalRef(getLocalRef(item, collection, index));
      const priorRef = localRefs.get(localRef);
      if (priorRef) {
        addIssue(warnings, 'duplicate_local_ref_candidate', 'Duplicate local reference candidate.', ref);
      } else {
        localRefs.set(localRef, ref);
      }

      const title = getItemTitle(item);
      if (title) {
        if (titles.has(title)) {
          addIssue(warnings, 'duplicate_title_candidate', 'Duplicate title candidate in collection.', ref);
        } else {
          titles.set(title, ref);
        }
      }

      if (['importantDates', 'timeline'].includes(collection) && hasText(item.date) && title) {
        const key = `${item.date.trim()}::${title}`;
        if (dateTitles.has(key)) {
          addIssue(warnings, 'duplicate_date_title_candidate', 'Duplicate date plus title candidate.', ref);
        } else {
          dateTitles.set(key, ref);
        }
      }
    });
  }
}

function validateCoverage(exportJson, warnings) {
  if (getTotalItems(exportJson) === 0) {
    addIssue(warnings, 'export_empty', 'Export has no content items.');
  }
}

function groupWarningsByRef(warnings) {
  const grouped = new Map();
  for (const warning of warnings) {
    const list = grouped.get(warning.ref) || [];
    list.push(warning.code);
    grouped.set(warning.ref, list);
  }
  return grouped;
}

function buildMediaPending(exportJson) {
  const pending = [];
  getCollectionItems(exportJson, 'blackHoleGallery').forEach((item, index) => {
    if (!isPlainObject(item)) return;
    const dataUrlCount = countDataUrls(item);
    if (dataUrlCount === 0 && !hasMediaSource(item)) return;
    pending.push({
      collection: 'blackHoleGallery',
      localRef: sanitizeLocalRef(getLocalRef(item, 'blackHoleGallery', index)),
      targetTable: 'media_assets',
      storageStatus: 'not_uploaded',
      reason: dataUrlCount > 0 ? 'data_url_detected' : 'media_source_pending_review',
      requiredFutureDecision: 'storage_policy_and_upload_phase_required',
    });
  });
  return pending;
}

function buildPlaylistPending(exportJson) {
  const pending = [];
  getCollectionItems(exportJson, 'playlist').forEach((item, index) => {
    if (!isPlainObject(item) || !hasPlaylistSource(item)) return;
    pending.push({
      collection: 'playlist',
      localRef: sanitizeLocalRef(getLocalRef(item, 'playlist', index)),
      targetTable: 'content_items',
      reason: 'playlist_source_pending_review',
      requiredFutureDecision: 'playlist_source_policy_required',
    });
  });
  return pending;
}

function buildIdentityMapping(exportJson, warnings) {
  const identities = new Map();
  for (const collection of EXPECTED_COLLECTIONS) {
    getCollectionItems(exportJson, collection).forEach((item) => {
      if (!isPlainObject(item)) return;
      for (const key of ['createdBy', 'updatedBy']) {
        if (hasText(item[key])) {
          const label = item[key].trim();
          identities.set(label, {
            localIdentityKey: label,
            remoteProfileHint: '<private_mapping_required>',
            status: ALLOWED_IDENTITIES.has(label) ? 'known_local_label' : 'unknown_local_label',
          });
        }
      }
    });
  }

  return {
    identities: [...identities.values()].sort((a, b) => a.localIdentityKey.localeCompare(b.localIdentityKey)),
    missingCount: warnings.filter((warning) => warning.code === 'identity_missing').length,
    unknownCount: warnings.filter((warning) => warning.code === 'identity_unknown').length,
  };
}

function summarizeIssues(issues) {
  return issues.slice(0, 20).map((issue) => ({
    code: issue.code,
    ref: issue.ref || '<export>',
  }));
}

function buildPlannedOperations(exportJson, warnings, errors) {
  if (errors.length > 0) return [];

  const warningsByRef = groupWarningsByRef(warnings);
  const planned = [];

  for (const collection of EXPECTED_COLLECTIONS) {
    getCollectionItems(exportJson, collection).forEach((item, index) => {
      if (!isPlainObject(item)) return;
      const ref = `${collection}[${index}]`;
      const warningCodes = warningsByRef.get(ref) || [];
      const status = warningCodes.length > 0 ? 'pending_review' : 'planned';
      planned.push({
        operation: 'planned_content_item',
        collection,
        targetTable: 'content_items',
        type: COLLECTION_TYPE_MAP[collection],
        localRef: sanitizeLocalRef(getLocalRef(item, collection, index)),
        status,
        warningCodes,
      });
    });
  }

  return planned;
}

function buildSkippedItems(exportJson, errors) {
  if (errors.length === 0) return [];

  const skipped = [];
  for (const collection of EXPECTED_COLLECTIONS) {
    getCollectionItems(exportJson, collection).forEach((item, index) => {
      skipped.push({
        collection,
        localRef: sanitizeLocalRef(getLocalRef(item, collection, index)),
        reason: 'dry_run_no_go',
      });
    });
  }
  return skipped;
}

function classify(errors, warnings) {
  if (errors.length > 0) return 'NO-GO';
  if (warnings.length > 0) return 'CHECK';
  return 'PASS';
}

function nextRecommendedAction(status) {
  if (status === 'PASS') return 'review_sanitized_dry_run_before_private_export_run';
  if (status === 'CHECK') return 'review_pending_media_playlist_or_warnings_before_any_insert';
  if (status === 'NO-GO') return 'repair_export_or_script_input_before_any_dry_run';
  if (status === 'ABORTED') return 'stop_and_remove_sensitive_input';
  if (status === 'INVALID_USAGE') return 'rerun_with_one_explicit_local_json_file';
  return 'resolve_blocker_before_any_dry_run';
}

function buildReport({
  inputFile,
  exportJson,
  validationStatus,
  dryRunStatus,
  warnings,
  errors,
  exitCode,
}) {
  const plannedOperations = buildPlannedOperations(exportJson, warnings, errors);
  const skippedItems = buildSkippedItems(exportJson, errors);
  const mediaPendingItems = buildMediaPending(exportJson);
  const playlistPendingItems = buildPlaylistPending(exportJson);
  const duplicateCandidates = warnings.filter((warning) => warning.code.includes('duplicate'));
  const collectionCounts = buildCollectionCounts(exportJson);

  return {
    reportVersion: 'private-local-export-dry-run-v1',
    generatedAt: new Date().toISOString(),
    inputFile,
    validationStatus,
    dryRunStatus,
    sourceVersion: Number(exportJson?.version) === 2 ? 2 : '<unknown>',
    counts: collectionCounts,
    totalItems: getTotalItems(exportJson),
    plannedOperationsCount: plannedOperations.length,
    plannedContentItemsCount: plannedOperations.length,
    plannedMediaAssetsPendingCount: mediaPendingItems.length,
    skippedItemsCount: skippedItems.length,
    warningsCount: warnings.length,
    conflictsCount: 0,
    duplicateCandidatesCount: duplicateCandidates.length,
    noGoReasonsCount: errors.length,
    identityMapping: buildIdentityMapping(exportJson, warnings),
    mediaPending: {
      count: mediaPendingItems.length,
      items: mediaPendingItems,
    },
    playlistPending: {
      count: playlistPendingItems.length,
      items: playlistPendingItems,
    },
    plannedOperations,
    skippedItems,
    warnings: summarizeIssues(warnings),
    conflicts: [],
    duplicateCandidates: summarizeIssues(duplicateCandidates),
    noGoReasons: summarizeIssues(errors),
    nextRecommendedAction: nextRecommendedAction(dryRunStatus),
    exitCode,
  };
}

function buildErrorReport({ inputFile, status, code, exitCode }) {
  return {
    reportVersion: 'private-local-export-dry-run-v1',
    generatedAt: new Date().toISOString(),
    inputFile,
    validationStatus: status,
    dryRunStatus: status,
    sourceVersion: '<unknown>',
    counts: {},
    totalItems: 0,
    plannedOperationsCount: 0,
    plannedContentItemsCount: 0,
    plannedMediaAssetsPendingCount: 0,
    skippedItemsCount: 0,
    warningsCount: 0,
    conflictsCount: 0,
    duplicateCandidatesCount: 0,
    noGoReasonsCount: 1,
    identityMapping: {
      identities: [],
      missingCount: 0,
      unknownCount: 0,
    },
    mediaPending: {
      count: 0,
      items: [],
    },
    playlistPending: {
      count: 0,
      items: [],
    },
    plannedOperations: [],
    skippedItems: [],
    warnings: [],
    conflicts: [],
    duplicateCandidates: [],
    noGoReasons: [{ code, ref: '<input>' }],
    nextRecommendedAction: nextRecommendedAction(status),
    exitCode,
  };
}

function printJson(report) {
  console.log(JSON.stringify(report, null, 2));
}

function printUsage(exitCode) {
  printJson({
    ...buildErrorReport({
      inputFile: '<missing-input>',
      status: 'INVALID_USAGE',
      code: 'invalid_argument_count',
      exitCode,
    }),
    usage: usage(),
  });
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
    printJson(buildErrorReport({
      inputFile: '<remote-input-rejected>',
      status: 'INVALID_USAGE',
      code: 'remote_input_rejected',
      exitCode,
    }));
    process.exitCode = exitCode;
    return;
  }

  if (input.includes('.env.local')) {
    const exitCode = EXIT_CODES.ABORTED;
    printJson(buildErrorReport({
      inputFile: '<env-file-rejected>',
      status: 'ABORTED',
      code: 'env_file_rejected',
      exitCode,
    }));
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
    printJson(buildErrorReport({
      inputFile: safeFile,
      status: 'INVALID_USAGE',
      code: 'file_unreadable',
      exitCode,
    }));
    process.exitCode = exitCode;
    return;
  }

  const securityFindings = scanForSecrets(rawText);
  if (securityFindings.length > 0) {
    const exitCode = EXIT_CODES.ABORTED;
    printJson(buildErrorReport({
      inputFile: safeFile,
      status: 'ABORTED',
      code: securityFindings[0].code,
      exitCode,
    }));
    process.exitCode = exitCode;
    return;
  }

  let exportJson;
  try {
    exportJson = JSON.parse(rawText);
  } catch {
    const exitCode = EXIT_CODES.INVALID_USAGE;
    printJson(buildErrorReport({
      inputFile: safeFile,
      status: 'INVALID_USAGE',
      code: 'invalid_json',
      exitCode,
    }));
    process.exitCode = exitCode;
    return;
  }

  const errors = [];
  const warnings = [];
  validateRequiredBlocks(exportJson, errors);

  if (errors.length === 0) {
    validateContent(exportJson, errors, warnings);
    detectDuplicateCandidates(exportJson, warnings);
    validateCoverage(exportJson, warnings);
  }

  const validationStatus = classify(errors, warnings);
  const dryRunStatus = validationStatus;
  const exitCode = EXIT_CODES[dryRunStatus];

  printJson(buildReport({
    inputFile: safeFile,
    exportJson,
    validationStatus,
    dryRunStatus,
    warnings,
    errors,
    exitCode,
  }));

  process.exitCode = exitCode;
}

await main();
