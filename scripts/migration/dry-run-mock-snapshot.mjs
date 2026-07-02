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

const EXPECTED_CONTENT_COLLECTIONS = Object.freeze([
  'monthlyLetters',
  'openWhenLetters',
  'reasons',
  'promises',
  'importantDates',
  'wishlist',
  'diary',
  'blackHoleGallery',
  'playlist',
]);

const EXPECTED_LOCAL_STATE_ARRAYS = Object.freeze([
  'hidden',
  'locked',
  'unlocked',
  'restored',
  'edited',
  'legacyIds',
]);

const COLLECTION_TYPE_MAP = Object.freeze({
  monthlyLetters: 'monthlyLetter',
  openWhenLetters: 'openWhenLetter',
  reasons: 'reason',
  promises: 'promise',
  importantDates: 'importantDate',
  wishlist: 'wishlistItem',
  diary: 'diaryEntry',
  blackHoleGallery: 'blackHoleGalleryItem',
  playlist: 'playlistItem',
});

const ALLOWED_ITEM_TYPES = new Set(Object.values(COLLECTION_TYPE_MAP));

const SECRET_PATTERNS = Object.freeze([
  { code: 'supabase_url', pattern: /https?:\/\/[a-z0-9-]+\.supabase\.co/i },
  { code: 'project_ref_like', pattern: /\b[a-z0-9]{20}\b/ },
  { code: 'publishable_or_secret_key', pattern: /\bsb_(publishable|secret)_[A-Za-z0-9_-]{16,}\b/ },
  { code: 'jwt_like_token', pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/ },
  { code: 'service_role_value', pattern: /\bservice[_-]role\b/i },
  { code: 'password_value', pattern: /"password"\s*:\s*"(?!<)[^"]{3,}"/i },
  { code: 'uuid_value', pattern: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b/ },
  { code: 'personal_email', pattern: /\b[A-Za-z0-9._%+-]+@(?!example\.invalid\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
  { code: 'private_absolute_path', pattern: /([A-Za-z]:\\Users\\[^\s"'<>]+|\/Users\/[^\s"'<>]+|\/home\/[^\s"'<>]+)/ },
  { code: 'access_or_refresh_token_key', pattern: /"?(access_token|refresh_token)"?\s*:/i },
]);

function usage() {
  return [
    `Usage: node scripts/migration/${SCRIPT_NAME} <local-mock-snapshot.json>`,
    'Input must be a local sanitized mock snapshot. Remote URLs are rejected.',
  ];
}

function sanitizePathForOutput(resolvedPath) {
  const relativePath = path.relative(process.cwd(), resolvedPath);
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return '<outside-repository>';
  }
  return relativePath.split(path.sep).join('/');
}

function isRemoteInput(value) {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function addIssue(list, code, message, ref = undefined) {
  list.push({ code, message, ref });
}

function readCount(counts, key) {
  return typeof counts[key] === 'number' ? counts[key] : undefined;
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

function countContentItems(content) {
  return EXPECTED_CONTENT_COLLECTIONS.reduce((total, key) => {
    const items = Array.isArray(content?.[key]) ? content[key] : [];
    return total + items.length;
  }, 0);
}

function validateRequiredBlocks(snapshot, errors) {
  const requiredObjects = ['source', 'content', 'localState', 'counts'];
  const requiredArrays = ['identities', 'media', 'warnings'];

  if (typeof snapshot.snapshotVersion !== 'string' || snapshot.snapshotVersion.trim() === '') {
    addIssue(errors, 'snapshot_version_missing', '`snapshotVersion` is required.');
  }
  if (typeof snapshot.exportedAt !== 'string' || snapshot.exportedAt.trim() === '') {
    addIssue(errors, 'exported_at_missing', '`exportedAt` is required.');
  }

  for (const key of requiredObjects) {
    if (!isPlainObject(snapshot[key])) {
      addIssue(errors, `${key}_missing`, `\`${key}\` must be an object.`);
    }
  }

  for (const key of requiredArrays) {
    if (!Array.isArray(snapshot[key])) {
      addIssue(errors, `${key}_missing`, `\`${key}\` must be an array.`);
    }
  }
}

function validateWarnings(snapshot, errors) {
  if (!Array.isArray(snapshot.warnings)) {
    return;
  }

  snapshot.warnings.forEach((warning, index) => {
    if (!isPlainObject(warning)) {
      addIssue(errors, 'warning_not_object', 'Warning entry must be an object.', `warnings[${index}]`);
      return;
    }
    if (typeof warning.type !== 'string' || warning.type.trim() === '') {
      addIssue(errors, 'warning_type_missing', 'Warning entry needs a type.', `warnings[${index}]`);
    }
  });
}

function validateContent(snapshot, errors) {
  if (!isPlainObject(snapshot.content)) {
    return;
  }

  for (const collection of EXPECTED_CONTENT_COLLECTIONS) {
    const items = snapshot.content[collection];
    if (!Array.isArray(items)) {
      addIssue(errors, 'content_collection_missing', `content.${collection} must be an array.`, collection);
      continue;
    }

    items.forEach((item, index) => {
      const ref = `${collection}[${index}]`;
      if (!isPlainObject(item)) {
        addIssue(errors, 'content_item_invalid', 'Content item must be an object.', ref);
        return;
      }
      if (typeof item.localId !== 'string' && typeof item.legacyId !== 'string') {
        addIssue(errors, 'content_item_id_missing', 'Content item needs localId or legacyId.', ref);
      }
      if (typeof item.type !== 'string' || item.type.trim() === '') {
        addIssue(errors, 'content_item_type_missing', 'Content item needs a type.', ref);
      } else if (!ALLOWED_ITEM_TYPES.has(item.type)) {
        addIssue(errors, 'content_item_type_unknown', `Unknown mock item type: ${item.type}`, ref);
      }
      if (!('data' in item)) {
        addIssue(errors, 'content_item_data_missing', 'Content item needs data.', ref);
      } else {
        try {
          JSON.stringify(item.data);
        } catch {
          addIssue(errors, 'content_item_data_not_serializable', 'Content item data must be serializable.', ref);
        }
      }
      for (const actorKey of ['createdBy', 'updatedBy']) {
        if (typeof item[actorKey] === 'string' && item[actorKey].includes('<UNRESOLVED')) {
          addIssue(errors, 'identity_unresolved', `${actorKey} is unresolved.`, ref);
        }
      }
    });
  }
}

function validateMedia(snapshot, errors) {
  if (!Array.isArray(snapshot.media)) {
    return;
  }

  snapshot.media.forEach((asset, index) => {
    if (!isPlainObject(asset)) {
      addIssue(errors, 'media_asset_invalid', 'Media entry must be an object.', `media[${index}]`);
      return;
    }
    if (asset.storageStatus !== 'not_uploaded') {
      addIssue(errors, 'media_storage_status_invalid', 'Media storageStatus must be not_uploaded.', `media[${index}]`);
    }
  });
}

function validateCounts(snapshot, errors) {
  if (!isPlainObject(snapshot.counts)) {
    return;
  }

  const expectations = new Map();
  if (Array.isArray(snapshot.identities)) {
    expectations.set('identities', snapshot.identities.length);
  }
  if (Array.isArray(snapshot.media)) {
    expectations.set('media', snapshot.media.length);
  }

  for (const collection of EXPECTED_CONTENT_COLLECTIONS) {
    if (Array.isArray(snapshot.content?.[collection])) {
      expectations.set(collection, snapshot.content[collection].length);
    }
  }

  for (const key of EXPECTED_LOCAL_STATE_ARRAYS) {
    if (Array.isArray(snapshot.localState?.[key])) {
      expectations.set(key, snapshot.localState[key].length);
    }
  }

  for (const [key, expected] of expectations) {
    const actual = readCount(snapshot.counts, key);
    if (actual === undefined) {
      addIssue(errors, 'count_missing', `counts.${key} is missing.`, key);
    } else if (actual !== expected) {
      addIssue(errors, 'count_mismatch', `counts.${key} expected ${expected} but found ${actual}.`, key);
    }
  }
}

function validateSnapshot(snapshot) {
  const errors = [];
  validateRequiredBlocks(snapshot, errors);
  validateWarnings(snapshot, errors);
  validateContent(snapshot, errors);
  validateMedia(snapshot, errors);
  validateCounts(snapshot, errors);
  return errors;
}

function classifySnapshot(snapshot, errors) {
  if (errors.length > 0) {
    return 'NO-GO';
  }
  if (snapshot.statusHint === 'BLOCKED') {
    return 'BLOCKED';
  }
  if (snapshot.statusHint === 'CHECK' || (Array.isArray(snapshot.warnings) && snapshot.warnings.length > 0)) {
    return 'CHECK';
  }
  return 'PASS';
}

function getContentItems(snapshot) {
  const items = [];
  if (!isPlainObject(snapshot.content)) {
    return items;
  }

  for (const collection of EXPECTED_CONTENT_COLLECTIONS) {
    const collectionItems = snapshot.content[collection];
    if (!Array.isArray(collectionItems)) {
      continue;
    }
    collectionItems.forEach((item) => {
      if (isPlainObject(item)) {
        items.push({ collection, item });
      }
    });
  }
  return items;
}

function localRefFor(item) {
  return typeof item.localId === 'string' ? item.localId : item.legacyId;
}

function buildPlannedOperations(snapshot, validationStatus) {
  if (validationStatus === 'NO-GO' || validationStatus === 'BLOCKED') {
    return [];
  }

  return getContentItems(snapshot).map(({ collection, item }) => {
    const warningCount = Array.isArray(snapshot.warnings)
      ? snapshot.warnings.filter((warning) => warning.localRef === localRefFor(item)).length
      : 0;
    return {
      operation: warningCount > 0 ? 'manual_review' : 'insert',
      remoteTable: 'content_items',
      remoteType: item.type || COLLECTION_TYPE_MAP[collection] || '<UNKNOWN_TYPE>',
      localSource: item.source || 'mock',
      localRef: localRefFor(item),
      status: warningCount > 0 ? 'CHECK' : 'PASS',
      reason: warningCount > 0 ? '<SANITIZED_REASON_REQUIRES_REVIEW>' : '<SANITIZED_REASON_READY_FOR_REVIEW>',
      warningsCount: warningCount,
      requiresHumanReview: warningCount > 0,
    };
  });
}

function buildMediaPending(snapshot) {
  if (!Array.isArray(snapshot.media)) {
    return [];
  }

  return snapshot.media.map((asset, index) => ({
    localRef: asset.localRef || `mock-media-${index + 1}`,
    type: asset.type || '<MOCK_MEDIA_TYPE>',
    storageStatus: asset.storageStatus || '<UNKNOWN_STORAGE_STATUS>',
    reason: '<SANITIZED_STORAGE_DECISION_REQUIRED>',
    requiredFutureDecision: 'storage_phase_required',
  }));
}

function buildIdentityMapping(snapshot) {
  if (!Array.isArray(snapshot.identities)) {
    return [];
  }

  return snapshot.identities.map((identity) => ({
    localIdentityKey: identity.localIdentityKey || '<UNKNOWN_LOCAL_IDENTITY>',
    remoteProfileHint: identity.remoteProfileHint || '<PRIVATE_MAPPING_REQUIRED>',
    status: identity.remoteProfileHint === '<UNRESOLVED>' ? 'blocked' : 'mock-only',
  }));
}

function buildCounts(snapshot, plannedOperations, errors) {
  const warnings = Array.isArray(snapshot.warnings) ? snapshot.warnings : [];
  const mediaPending = Array.isArray(snapshot.media) ? snapshot.media : [];
  const contentItems = getContentItems(snapshot);

  const byContentType = {};
  for (const { collection } of contentItems) {
    byContentType[collection] = (byContentType[collection] || 0) + 1;
  }

  return {
    totalInputItems: contentItems.length,
    totalValidItems: errors.length === 0 ? contentItems.length : 0,
    totalSkippedItems: errors.length > 0 ? contentItems.length : 0,
    totalWarnings: warnings.length,
    totalConflicts: 0,
    totalDuplicateCandidates: 0,
    totalMediaPendingStorage: mediaPending.length,
    byContentType,
    byRemoteTable: {
      profiles: 0,
      relationship_spaces: 0,
      universe_members: 0,
      content_items: plannedOperations.length,
      content_events: plannedOperations.length,
      media_assets: 0,
    },
    byOperationType: {
      insert: plannedOperations.filter((operation) => operation.operation === 'insert').length,
      update: 0,
      skip: errors.length > 0 ? contentItems.length : 0,
      manual_review: plannedOperations.filter((operation) => operation.operation === 'manual_review').length,
    },
  };
}

function buildReport(snapshot, validationStatus, dryRunStatus, errors) {
  const plannedOperations = buildPlannedOperations(snapshot, validationStatus);
  const noGoReasons = errors.map((error) => ({
    type: error.code,
    localRef: error.ref || '<SNAPSHOT>',
    message: error.message,
  }));

  return {
    reportVersion: 'migration-dry-run-report-v1',
    generatedAt: '<ISO_TIMESTAMP>',
    sourceSnapshotVersion: snapshot.snapshotVersion || '<MISSING_SNAPSHOT_VERSION>',
    validationStatus,
    dryRunStatus,
    counts: buildCounts(snapshot, plannedOperations, errors),
    plannedOperations,
    skippedItems: errors.length > 0
      ? getContentItems(snapshot).map(({ item }) => ({
          localRef: localRefFor(item) || '<UNKNOWN_LOCAL_REF>',
          reason: '<SANITIZED_SKIP_DUE_TO_NO_GO>',
        }))
      : [],
    warnings: Array.isArray(snapshot.warnings) ? snapshot.warnings : [],
    conflicts: [],
    duplicateCandidates: [],
    identityMapping: buildIdentityMapping(snapshot),
    mediaPending: buildMediaPending(snapshot),
    unmappedFields: [],
    noGoReasons,
    nextRecommendedAction: dryRunStatus === 'PASS' ? 'human_review_before_any_insert' : 'resolve_checks_before_any_insert',
  };
}

function printUsage(exitCode) {
  console.log('Mock dry-run report');
  console.log(`script: ${SCRIPT_NAME}`);
  console.log('result: INVALID_USAGE');
  for (const line of usage()) {
    console.log(line);
  }
  console.log(`exit code: ${exitCode}`);
}

function printDryRunOutput({ file, report, exitCode }) {
  console.log('Mock dry-run report');
  console.log(`script: ${SCRIPT_NAME}`);
  console.log(`input file: ${file}`);
  console.log(`dryRunStatus: ${report.dryRunStatus}`);
  console.log(`counts: ${JSON.stringify(report.counts)}`);
  console.log(`planned operations count: ${report.plannedOperations.length}`);
  console.log(`warnings count: ${report.warnings.length}`);
  console.log(`conflicts count: ${report.conflicts.length}`);
  console.log(`noGoReasons count: ${report.noGoReasons.length}`);
  console.log(`nextRecommendedAction: ${report.nextRecommendedAction}`);
  console.log('report:');
  console.log(JSON.stringify(report, null, 2));
  console.log(`exit code: ${exitCode}`);
}

function printErrorOutput({ file, result, code, message, exitCode }) {
  console.log('Mock dry-run report');
  console.log(`script: ${SCRIPT_NAME}`);
  console.log(`input file: ${file}`);
  console.log(`dryRunStatus: ${result}`);
  console.log('counts: {"totalInputItems":0,"totalValidItems":0,"totalSkippedItems":0}');
  console.log('planned operations count: 0');
  console.log('warnings count: 0');
  console.log('conflicts count: 0');
  console.log('noGoReasons count: 1');
  console.log('nextRecommendedAction: fix_input_before_any_dry_run');
  console.log('errors:');
  console.log(`- ${code}: ${message}`);
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
    printErrorOutput({
      file: '<remote-input-rejected>',
      result: 'INVALID_USAGE',
      code: 'remote_input_rejected',
      message: 'Remote URLs are not accepted as input.',
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  if (input.includes('.env.local')) {
    const exitCode = EXIT_CODES.ABORTED;
    printErrorOutput({
      file: '<env-file-rejected>',
      result: 'ABORTED',
      code: 'env_file_rejected',
      message: '.env.local input is forbidden.',
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
    printErrorOutput({
      file: safeFile,
      result: 'INVALID_USAGE',
      code: 'file_not_found_or_unreadable',
      message: 'Input file does not exist or cannot be read.',
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  const securityFindings = scanForSecrets(rawText);
  if (securityFindings.length > 0) {
    const exitCode = EXIT_CODES.ABORTED;
    printErrorOutput({
      file: safeFile,
      result: 'ABORTED',
      code: securityFindings[0].code,
      message: securityFindings[0].message,
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  let snapshot;
  try {
    snapshot = JSON.parse(rawText);
  } catch {
    const exitCode = EXIT_CODES.INVALID_USAGE;
    printErrorOutput({
      file: safeFile,
      result: 'INVALID_USAGE',
      code: 'invalid_json',
      message: 'Input file is not valid JSON.',
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  const errors = validateSnapshot(snapshot);
  const validationStatus = classifySnapshot(snapshot, errors);
  const dryRunStatus = validationStatus;
  const exitCode = EXIT_CODES[dryRunStatus];
  const report = buildReport(snapshot, validationStatus, dryRunStatus, errors);

  printDryRunOutput({ file: safeFile, report, exitCode });
  process.exitCode = exitCode;
}

await main();
