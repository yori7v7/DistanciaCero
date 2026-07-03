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

const SELECTABLE_TYPES = new Set([
  'monthly_letter',
  'open_when_letter',
  'reason',
  'promise',
  'important_date',
  'future_dream',
  'timeline_event',
]);

const DEFERRED_TYPES = new Set(['gallery_item', 'playlist_item']);
const SAFE_IDENTITIES = new Set(['local-yori', 'local-ale']);

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
  { code: 'data_url', pattern: /data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/i },
]);

function usage() {
  return [
    `Usage: node scripts/migration/${SCRIPT_NAME} <sanitized-dry-run-report.json>`,
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

function scanForSecrets(rawText) {
  const findings = [];
  for (const check of SECRET_PATTERNS) {
    if (check.pattern.test(rawText)) {
      findings.push({ code: check.code, ref: '<input>' });
    }
  }
  return findings;
}

function sanitizeLocalRef(value) {
  const text = String(value ?? '<unknown>').trim();
  if (!text || text.startsWith('<')) return '<sanitized-local-ref>';
  const sanitized = text.replace(/[^\w:.[\]-]/g, '_');
  return sanitized.length > 64 ? `${sanitized.slice(0, 61)}...` : sanitized;
}

function sanitizeIdentityKey(value) {
  return SAFE_IDENTITIES.has(value) ? value : '<private_mapping_required>';
}

function issue(code, ref = '<input>') {
  return { code, ref };
}

function summarizeIssues(issues) {
  return issues.slice(0, 20).map((item) => ({
    code: item.code || 'unknown_issue',
    ref: item.ref || '<input>',
  }));
}

function countWarnings(report) {
  if (typeof report.warningsCount === 'number') return report.warningsCount;
  return Array.isArray(report.warnings) ? report.warnings.length : 0;
}

function countNoGoReasons(report) {
  if (typeof report.noGoReasonsCount === 'number') return report.noGoReasonsCount;
  return Array.isArray(report.noGoReasons) ? report.noGoReasons.length : 0;
}

function countConflicts(report) {
  if (typeof report.conflictsCount === 'number') return report.conflictsCount;
  return Array.isArray(report.conflicts) ? report.conflicts.length : 0;
}

function countDuplicateCandidates(report) {
  if (typeof report.duplicateCandidatesCount === 'number') {
    return report.duplicateCandidatesCount;
  }
  return Array.isArray(report.duplicateCandidates) ? report.duplicateCandidates.length : 0;
}

function validateDryRunReport(report) {
  const errors = [];

  if (!isPlainObject(report)) {
    return [issue('report_not_object')];
  }

  if (Number(report.version) === 2 && isPlainObject(report.content)) {
    errors.push(issue('export_v2_input_rejected'));
  }

  if (typeof report.reportVersion !== 'string' || report.reportVersion.trim() === '') {
    errors.push(issue('report_version_missing'));
  }
  if (!['PASS', 'CHECK', 'NO-GO'].includes(report.validationStatus)) {
    errors.push(issue('validation_status_invalid'));
  }
  if (!['PASS', 'CHECK', 'NO-GO'].includes(report.dryRunStatus)) {
    errors.push(issue('dry_run_status_invalid'));
  }
  if (!isPlainObject(report.counts)) {
    errors.push(issue('counts_missing'));
  }
  if (typeof report.totalItems !== 'number') {
    errors.push(issue('total_items_missing'));
  }
  if (!Array.isArray(report.plannedOperations)) {
    errors.push(issue('planned_operations_missing'));
  }
  if (!isPlainObject(report.mediaPending)) {
    errors.push(issue('media_pending_missing'));
  }
  if (!isPlainObject(report.playlistPending)) {
    errors.push(issue('playlist_pending_missing'));
  }
  if (!Array.isArray(report.conflicts)) {
    errors.push(issue('conflicts_missing'));
  }
  if (!Array.isArray(report.duplicateCandidates)) {
    errors.push(issue('duplicate_candidates_missing'));
  }
  if (!Array.isArray(report.noGoReasons)) {
    errors.push(issue('no_go_reasons_missing'));
  }
  if (!isPlainObject(report.identityMapping)) {
    errors.push(issue('identity_mapping_missing'));
  }
  if (!Array.isArray(report.warnings)) {
    errors.push(issue('warnings_missing'));
  }

  return errors;
}

function hasBlockingNoGo(report) {
  return report.dryRunStatus === 'NO-GO' || countNoGoReasons(report) > 0 || countConflicts(report) > 0;
}

function getWarningCodes(operation) {
  return Array.isArray(operation.warningCodes)
    ? operation.warningCodes.filter((code) => typeof code === 'string')
    : [];
}

function shouldDefer(operation) {
  const warningCodes = getWarningCodes(operation);
  if (operation.status !== 'planned') return true;
  if (warningCodes.length > 0) return true;
  if (DEFERRED_TYPES.has(operation.type)) return true;
  if (warningCodes.includes('media_pending_storage')) return true;
  if (warningCodes.includes('playlist_source_pending_review')) return true;
  return false;
}

function isSelectable(operation) {
  return (
    isPlainObject(operation) &&
    operation.status === 'planned' &&
    getWarningCodes(operation).length === 0 &&
    operation.targetTable === 'content_items' &&
    SELECTABLE_TYPES.has(operation.type)
  );
}

function getDeferredReason(operation) {
  const warningCodes = getWarningCodes(operation);
  if (warningCodes.includes('media_pending_storage') || operation.type === 'gallery_item') {
    return {
      reasonCode: 'media_pending_storage',
      requiredFutureDecision: 'storage_policy_and_upload_phase_required',
      targetTable: 'media_assets',
    };
  }
  if (warningCodes.includes('playlist_source_pending_review') || operation.type === 'playlist_item') {
    return {
      reasonCode: 'playlist_source_pending_review',
      requiredFutureDecision: 'playlist_source_policy_required',
      targetTable: 'content_items',
    };
  }
  if (operation.status !== 'planned') {
    return {
      reasonCode: 'pending_review',
      requiredFutureDecision: 'human_review_required',
      targetTable: operation.targetTable || 'content_items',
    };
  }
  return {
    reasonCode: 'warning_codes_present',
    requiredFutureDecision: 'human_review_required',
    targetTable: operation.targetTable || 'content_items',
  };
}

function countByCollection(items) {
  const counts = {};
  for (const item of items) {
    const key = item.sourceCollection || '<unknown>';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function buildSelectedItem(operation, index) {
  return {
    manifestItemId: `manifest-item-${String(index + 1).padStart(3, '0')}`,
    sourceCollection: operation.collection || '<unknown>',
    targetTable: 'content_items',
    remoteType: operation.type,
    localRef: sanitizeLocalRef(operation.localRef),
    identityKey: sanitizeIdentityKey(operation.identityKey),
    hasPayload: true,
    payloadIncludedInManifest: false,
    status: 'selected_for_lab_insert',
    warningCodes: [],
    requiredBeforeInsert: [
      'identity_mapping_confirmed',
      'lab_space_confirmed',
      'user_go_confirmed',
    ],
    rollbackGroup: '<future_migration_run_id>',
  };
}

function buildDeferredItem(operation) {
  const reason = getDeferredReason(operation);
  return {
    sourceCollection: operation.collection || '<unknown>',
    targetTable: reason.targetTable,
    remoteType: operation.type || '<unknown>',
    localRef: sanitizeLocalRef(operation.localRef),
    status: 'deferred',
    reasonCode: reason.reasonCode,
    requiredFutureDecision: reason.requiredFutureDecision,
    insertAllowedNow: false,
  };
}

function getIdentityStatus(report) {
  const mapping = report.identityMapping || {};
  const missing = Number(mapping.missingCount || 0);
  const unknown = Number(mapping.unknownCount || 0);
  if (missing > 0 || unknown > 0) return 'blocked';
  return 'pending_private_resolution';
}

function classifyManifest(report, validationErrors, selectedItems, deferredItems) {
  if (validationErrors.length > 0 || hasBlockingNoGo(report)) return 'NO-GO';
  if (deferredItems.length > 0 || countWarnings(report) > 0 || report.dryRunStatus === 'CHECK') {
    return 'CHECK';
  }
  if (selectedItems.length === 0) return 'CHECK';
  return 'PASS';
}

function buildManifest({ report, inputFile, manifestStatus, selectedItems, deferredItems, noGoReasons, exitCode }) {
  return {
    manifestVersion: 'private-insert-manifest-v1',
    generatedAt: new Date().toISOString(),
    manifestStatus,
    source: {
      dryRunReportVersion: report.reportVersion || '<unknown>',
      validationStatus: report.validationStatus || '<unknown>',
      dryRunStatus: report.dryRunStatus || '<unknown>',
      inputFile,
    },
    policy: {
      policyName: 'controlled_private_lab_insert_policy',
      selectedMode: 'clean_content_items_only',
      labOnly: true,
      productionAllowed: false,
    },
    target: {
      environment: 'disposable_lab',
      tables: ['content_items'],
      excludedTables: ['media_assets', 'storage', 'content_events'],
    },
    counts: {
      sourceTotalItems: typeof report.totalItems === 'number' ? report.totalItems : 0,
      selectedItemsCount: selectedItems.length,
      deferredItemsCount: deferredItems.length,
      selectedByCollection: countByCollection(selectedItems),
      deferredByCollection: countByCollection(deferredItems),
    },
    identityMapping: {
      'local-yori': '<private_mapping_required>',
      'local-ale': '<private_mapping_required>',
      status: getIdentityStatus(report),
    },
    selectedItems,
    deferredItems,
    safety: {
      noSupabaseTouched: true,
      noInsertExecuted: true,
      noPayloadIncluded: true,
      noDataUrlsIncluded: true,
      noPrivatePathsIncluded: true,
      requiresExplicitGoBeforeInsert: true,
      labOnly: true,
      productionAllowed: false,
    },
    rollback: {
      rollbackStrategy: 'lab_reset_or_future_migration_run_id',
      migrationRunId: '<future_migration_run_id>',
      deleteByMigrationRunIdImplemented: false,
    },
    noGoReasons: summarizeIssues(noGoReasons),
    nextRecommendedAction: manifestStatus === 'NO-GO'
      ? 'repair_dry_run_before_manifest_generation'
      : 'review_manifest_before_any_insert',
    exitCode,
  };
}

function buildErrorManifest({ inputFile, status, code, exitCode }) {
  return {
    manifestVersion: 'private-insert-manifest-v1',
    generatedAt: new Date().toISOString(),
    manifestStatus: status,
    source: {
      dryRunReportVersion: '<unknown>',
      validationStatus: status,
      dryRunStatus: status,
      inputFile,
    },
    policy: {
      policyName: 'controlled_private_lab_insert_policy',
      selectedMode: 'clean_content_items_only',
      labOnly: true,
      productionAllowed: false,
    },
    target: {
      environment: 'disposable_lab',
      tables: ['content_items'],
      excludedTables: ['media_assets', 'storage', 'content_events'],
    },
    counts: {
      sourceTotalItems: 0,
      selectedItemsCount: 0,
      deferredItemsCount: 0,
      selectedByCollection: {},
      deferredByCollection: {},
    },
    identityMapping: {
      'local-yori': '<private_mapping_required>',
      'local-ale': '<private_mapping_required>',
      status: 'pending_private_resolution',
    },
    selectedItems: [],
    deferredItems: [],
    safety: {
      noSupabaseTouched: true,
      noInsertExecuted: true,
      noPayloadIncluded: true,
      noDataUrlsIncluded: true,
      noPrivatePathsIncluded: true,
      requiresExplicitGoBeforeInsert: true,
      labOnly: true,
      productionAllowed: false,
    },
    rollback: {
      rollbackStrategy: 'lab_reset_or_future_migration_run_id',
      migrationRunId: '<future_migration_run_id>',
      deleteByMigrationRunIdImplemented: false,
    },
    noGoReasons: [{ code, ref: '<input>' }],
    nextRecommendedAction: status === 'INVALID_USAGE'
      ? 'rerun_with_one_explicit_local_json_file'
      : 'stop_and_remove_sensitive_input',
    exitCode,
  };
}

function printJson(manifest) {
  console.log(JSON.stringify(manifest, null, 2));
}

function printUsage(exitCode) {
  printJson({
    ...buildErrorManifest({
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
    printJson(buildErrorManifest({
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
    printJson(buildErrorManifest({
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
    printJson(buildErrorManifest({
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
    printJson(buildErrorManifest({
      inputFile: safeFile,
      status: 'ABORTED',
      code: securityFindings[0].code,
      exitCode,
    }));
    process.exitCode = exitCode;
    return;
  }

  let report;
  try {
    report = JSON.parse(rawText);
  } catch {
    const exitCode = EXIT_CODES.INVALID_USAGE;
    printJson(buildErrorManifest({
      inputFile: safeFile,
      status: 'INVALID_USAGE',
      code: 'invalid_json',
      exitCode,
    }));
    process.exitCode = exitCode;
    return;
  }

  const validationErrors = validateDryRunReport(report);
  const plannedOperations = Array.isArray(report.plannedOperations) ? report.plannedOperations : [];
  const selectedItems = validationErrors.length === 0
    ? plannedOperations.filter(isSelectable).map(buildSelectedItem)
    : [];
  const deferredItems = validationErrors.length === 0
    ? plannedOperations.filter((operation) => isPlainObject(operation) && shouldDefer(operation)).map(buildDeferredItem)
    : [];
  const noGoReasons = [
    ...validationErrors,
    ...(Array.isArray(report.noGoReasons) ? report.noGoReasons : []),
    ...(hasBlockingNoGo(report) && countNoGoReasons(report) === 0 ? [issue('dry_run_blocking_state')] : []),
  ];
  const manifestStatus = classifyManifest(report, validationErrors, selectedItems, deferredItems);
  const exitCode = EXIT_CODES[manifestStatus];

  printJson(buildManifest({
    report,
    inputFile: safeFile,
    manifestStatus,
    selectedItems,
    deferredItems,
    noGoReasons,
    exitCode,
  }));

  process.exitCode = exitCode;
}

await main();
