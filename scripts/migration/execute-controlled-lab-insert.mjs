import { readFile } from 'fs/promises';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const SCRIPT_FILE = fileURLToPath(import.meta.url);
const SCRIPT_NAME = path.basename(SCRIPT_FILE);

const EXIT_CODES = Object.freeze({
  PASS: 0,
  'NO-GO': 1,
  ABORTED: 4,
  INVALID_USAGE: 5,
});

const MODES = Object.freeze({
  FIXTURE: 'fixture-no-network',
  PRIVATE_VALIDATE: 'private-validate-no-network',
});
const EXPECTED_ROW_COUNT = 14;
const EXPECTED_DEFERRED_COUNT = 4;

const BASE_REQUIRED_FLAGS = new Set([
  '--confirm-no-supabase',
  '--confirm-no-insert',
  '--confirm-lab-only',
]);

const PRIVATE_VALIDATE_REQUIRED_FLAGS = new Set([
  ...BASE_REQUIRED_FLAGS,
  '--confirm-private-payload-outside-repo',
]);

const ALLOWED_TYPES = new Set([
  'monthly_letter',
  'open_when_letter',
  'reason',
  'promise',
  'important_date',
  'future_dream',
  'timeline_event',
]);

const BLOCKED_TYPES = new Set([
  'gallery_item',
  'playlist_item',
  'media_asset',
  'content_event',
  'storage_object',
]);

const BLOCKED_COLLECTIONS = new Set(['blackHoleGallery', 'playlist']);
const BLOCKED_ROW_TARGETS = new Set(['media_assets', 'storage', 'content_events']);

const SECRET_PATTERNS = Object.freeze([
  { code: 'supabase_url', pattern: /https?:\/\/[a-z0-9-]+\.supabase\.co/i },
  { code: 'project_ref_like', pattern: /\b[a-z0-9]{20}\b/ },
  { code: 'publishable_or_secret_key', pattern: /\bsb_(publishable|secret)_[A-Za-z0-9_-]{16,}\b/ },
  { code: 'jwt_like_token', pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/ },
  { code: 'service_role_marker', pattern: /\bservice[-_]?role\b/i },
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

const URL_PATTERN = /https?:\/\//i;
const SAFE_PRIVATE_LOCAL_REF_PATTERN = /^[A-Za-z0-9_.:[\]-]{1,120}$/;

function usage() {
  return [
    `Usage: node scripts/migration/${SCRIPT_NAME} <payload.json> --mode fixture-no-network --confirm-no-supabase --confirm-no-insert --confirm-lab-only`,
    `   or: node scripts/migration/${SCRIPT_NAME} <payload.json> --mode private-validate-no-network --confirm-no-supabase --confirm-no-insert --confirm-lab-only --confirm-private-payload-outside-repo`,
    'Input must be an explicit local JSON file. Remote URLs are rejected.',
    'This script is no-network only and never inserts data.',
  ];
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isRemoteInput(value) {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
}

function sanitizePathForOutput(resolvedPath) {
  const relativePath = path.relative(process.cwd(), resolvedPath);
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return '<outside-repository>';
  }
  return relativePath.split(path.sep).join('/');
}

function isInsideRepository(resolvedPath) {
  const relativePath = path.relative(process.cwd(), resolvedPath);
  return Boolean(relativePath) && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
}

function hasGitSegment(resolvedPath) {
  return resolvedPath.split(path.sep).some((part) => part === '.git');
}

function issue(code, ref = '<input>') {
  return { code, ref };
}

function summarizeIssues(issues) {
  return issues.slice(0, 30).map((item) => ({
    code: item.code || 'unknown_issue',
    ref: item.ref || '<input>',
  }));
}

function scanForSecrets(rawText) {
  const findings = [];
  for (const check of SECRET_PATTERNS) {
    if (check.pattern.test(rawText)) {
      findings.push(issue(check.code));
    }
  }
  return findings;
}

function sanitizeLocalRef(value) {
  const text = String(value ?? '<unknown>').trim();
  if (!text) return '<unknown>';
  const sanitized = text.replace(/[^\w:.[\]-]/g, '_');
  return sanitized.length > 80 ? `${sanitized.slice(0, 77)}...` : sanitized;
}

function isSanitizedRef(value) {
  if (typeof value !== 'string') return false;
  const text = value.trim();
  return Boolean(text) && (
    text.startsWith('mock-')
    || text.startsWith('<')
    || text.includes('<future_')
  );
}

function isSafePrivateLocalRef(value) {
  if (isSanitizedRef(value)) return true;
  if (typeof value !== 'string') return false;
  const text = value.trim();
  return Boolean(text) && SAFE_PRIVATE_LOCAL_REF_PATTERN.test(text);
}

function validateArgs(args) {
  if (args.length !== 6 && args.length !== 7) return { ok: false, code: 'invalid_argument_count' };
  const [payloadInput, modeFlag, modeValue, ...flags] = args;
  if (isRemoteInput(payloadInput)) return { ok: false, code: 'remote_input_rejected' };
  if (payloadInput.includes('.env.local')) return { ok: false, code: 'env_file_rejected', aborted: true };
  if (modeFlag !== '--mode' || !Object.values(MODES).includes(modeValue)) {
    return { ok: false, code: 'invalid_mode' };
  }
  const requiredFlags = modeValue === MODES.PRIVATE_VALIDATE
    ? PRIVATE_VALIDATE_REQUIRED_FLAGS
    : BASE_REQUIRED_FLAGS;
  const flagSet = new Set(flags);
  for (const required of requiredFlags) {
    if (!flagSet.has(required)) return { ok: false, code: 'missing_required_flag', mode: modeValue };
  }
  if (flagSet.size !== requiredFlags.size) return { ok: false, code: 'unknown_flag', mode: modeValue };
  if (modeValue === MODES.FIXTURE && flagSet.has('--confirm-private-payload-outside-repo')) {
    return { ok: false, code: 'private_payload_flag_not_allowed_in_fixture_mode', mode: modeValue };
  }
  return { ok: true, payloadInput, mode: modeValue };
}

function validatePrivatePayloadLocation(inputPath) {
  const resolvedPath = path.resolve(process.cwd(), inputPath);
  if (hasGitSegment(resolvedPath)) {
    return { ok: false, code: 'private_payload_git_path_rejected' };
  }
  if (isInsideRepository(resolvedPath)) {
    return { ok: false, code: 'private_payload_inside_repository_rejected' };
  }
  return { ok: true };
}

async function readPayload(inputPath) {
  const resolvedPath = path.resolve(process.cwd(), inputPath);
  const safeFile = sanitizePathForOutput(resolvedPath);
  let rawText;
  try {
    rawText = await readFile(resolvedPath, 'utf8');
  } catch {
    return { ok: false, safeFile, status: 'INVALID_USAGE', exitCode: EXIT_CODES.INVALID_USAGE, code: 'file_unreadable' };
  }

  const securityFindings = scanForSecrets(rawText);
  if (securityFindings.length > 0) {
    return { ok: false, safeFile, status: 'ABORTED', exitCode: EXIT_CODES.ABORTED, code: securityFindings[0].code };
  }

  try {
    return { ok: true, safeFile, value: JSON.parse(rawText) };
  } catch {
    return { ok: false, safeFile, status: 'INVALID_USAGE', exitCode: EXIT_CODES.INVALID_USAGE, code: 'invalid_json' };
  }
}

function getDeferredRowsCount(payload) {
  if (typeof payload.deferredRowsCount === 'number') return payload.deferredRowsCount;
  if (typeof payload.deferredItemsCount === 'number') return payload.deferredItemsCount;
  if (Array.isArray(payload.deferredRows)) return payload.deferredRows.length;
  return EXPECTED_DEFERRED_COUNT;
}

function countRowsByType(rows) {
  const counts = {};
  for (const row of rows) {
    const key = typeof row?.type === 'string' ? row.type : '<unknown>';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function validateRow(row, index, mode) {
  const errors = [];
  const ref = `rows[${index}]`;
  if (!isPlainObject(row)) return [issue('row_not_object', ref)];

  if (row.targetTable !== 'content_items') errors.push(issue('row_target_not_content_items', ref));

  const type = row.type;
  if (!ALLOWED_TYPES.has(type)) errors.push(issue('row_type_not_allowed', ref));
  if (BLOCKED_TYPES.has(type)) errors.push(issue('row_type_blocked', ref));
  if (BLOCKED_COLLECTIONS.has(row.sourceCollection) || BLOCKED_COLLECTIONS.has(row.collection)) {
    errors.push(issue('row_collection_blocked', ref));
  }
  if (BLOCKED_ROW_TARGETS.has(row.targetTable)) errors.push(issue('row_blocked_target', ref));

  const localRefIsAllowed = mode === MODES.PRIVATE_VALIDATE
    ? isSafePrivateLocalRef(row.sourceLocalRef)
    : isSanitizedRef(row.sourceLocalRef);
  if (!localRefIsAllowed) errors.push(issue('row_source_local_ref_not_sanitized', ref));
  if (!isSanitizedRef(row.migrationRunId)) errors.push(issue('row_migration_run_id_not_sanitized', ref));

  const rowText = JSON.stringify(row);
  if (URL_PATTERN.test(rowText)) errors.push(issue('row_full_url_detected', ref));
  for (const blocked of BLOCKED_ROW_TARGETS) {
    if (rowText.includes(blocked)) errors.push(issue('row_blocked_target_text', ref));
  }

  return errors;
}

function validatePayload(payload, mode) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(payload)) return { errors: [issue('payload_not_object')], warnings };

  const payloadText = JSON.stringify(payload);
  if (URL_PATTERN.test(payloadText)) errors.push(issue('payload_full_url_detected'));

  if (typeof payload.payloadVersion !== 'string' || payload.payloadVersion.trim() === '') {
    errors.push(issue('payload_version_missing'));
  }
  if (payload.labOnly !== true) errors.push(issue('lab_only_not_true'));
  if (payload.notProduction !== true) errors.push(issue('not_production_not_true'));
  if (payload.productionAllowed === true) errors.push(issue('production_allowed_true'));
  if (payload.targetTable !== 'content_items') errors.push(issue('target_table_not_content_items'));

  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  if (!Array.isArray(payload.rows)) errors.push(issue('rows_missing'));
  if (rows.length !== EXPECTED_ROW_COUNT) errors.push(issue('rows_count_not_14'));

  for (const [index, row] of rows.entries()) {
    errors.push(...validateRow(row, index, mode));
  }

  const rowsByType = countRowsByType(rows);
  for (const type of ALLOWED_TYPES) {
    if (rowsByType[type] !== 2) {
      errors.push(issue('rows_by_type_invalid', type));
    }
  }

  return { errors, warnings };
}

function nextRecommendedAction(status, mode) {
  if (status === 'PASS' && mode === MODES.PRIVATE_VALIDATE) {
    return 'review_private_validate_no_network_result_before_real_payload_use';
  }
  if (status === 'PASS') return 'audit_private_validate_no_network_mode_before_real_payload_use';
  if (status === 'NO-GO') return 'repair_mock_payload_before_executor_use';
  if (status === 'ABORTED') return 'stop_and_remove_sensitive_input';
  return mode === MODES.PRIVATE_VALIDATE
    ? 'rerun_with_outside_repo_payload_and_required_private_validate_flags'
    : 'rerun_with_local_payload_and_required_fixture_no_network_flags';
}

function buildSummary({
  status,
  payloadFile,
  payload,
  rows,
  noGoReasons,
  warnings,
  exitCode,
  mode,
}) {
  const plannedRowsCount = status === 'PASS' ? rows.length : 0;
  const reportMode = mode || MODES.FIXTURE;
  return {
    executorVersion: 'controlled-lab-insert-executor-v1',
    generatedAt: new Date().toISOString(),
    executorStatus: status,
    mode: reportMode,
    target: 'lab-only',
    payloadFile,
    targetTable: 'content_items',
    plannedRowsCount,
    insertedRowsCount: 0,
    skippedRowsCount: status === 'PASS' ? 0 : rows.length,
    deferredRowsCount: isPlainObject(payload) ? getDeferredRowsCount(payload) : 0,
    rowsByType: countRowsByType(rows),
    productionBlocked: true,
    storageBlocked: true,
    noSupabaseTouched: true,
    noInsertExecuted: true,
    noNetwork: true,
    payloadPrinted: false,
    appStillDisconnected: true,
    privatePayloadValidated: reportMode === MODES.PRIVATE_VALIDATE && status === 'PASS',
    rollbackRequiredBeforeRealInsert: true,
    noGoReasons: summarizeIssues(noGoReasons),
    warnings: summarizeIssues(warnings),
    nextRecommendedAction: nextRecommendedAction(status, reportMode),
    exitCode,
  };
}

function printJson(report) {
  console.log(JSON.stringify(report, null, 2));
}

function printInvalidUsage(code, mode = MODES.FIXTURE) {
  const exitCode = EXIT_CODES.INVALID_USAGE;
  printJson({
    ...buildSummary({
      status: 'INVALID_USAGE',
      payloadFile: '<missing-or-invalid-input>',
      payload: undefined,
      rows: [],
      noGoReasons: [issue(code)],
      warnings: [],
      exitCode,
      mode,
    }),
    usage: usage(),
  });
  process.exitCode = exitCode;
}

async function main() {
  const parsed = validateArgs(process.argv.slice(2));
  if (!parsed.ok) {
    if (parsed.aborted) {
      const exitCode = EXIT_CODES.ABORTED;
      printJson(buildSummary({
        status: 'ABORTED',
        payloadFile: '<missing-or-invalid-input>',
        payload: undefined,
        rows: [],
        noGoReasons: [issue(parsed.code)],
        warnings: [],
        exitCode,
        mode: MODES.FIXTURE,
      }));
      process.exitCode = exitCode;
      return;
    }
    printInvalidUsage(parsed.code, parsed.mode || MODES.FIXTURE);
    return;
  }

  if (parsed.mode === MODES.PRIVATE_VALIDATE) {
    const location = validatePrivatePayloadLocation(parsed.payloadInput);
    if (!location.ok) {
      const exitCode = EXIT_CODES.INVALID_USAGE;
      printJson(buildSummary({
        status: 'INVALID_USAGE',
        payloadFile: '<outside-repository>',
        payload: undefined,
        rows: [],
        noGoReasons: [issue(location.code)],
        warnings: [],
        exitCode,
        mode: parsed.mode,
      }));
      process.exitCode = exitCode;
      return;
    }
  }

  const payloadRead = await readPayload(parsed.payloadInput);
  if (!payloadRead.ok) {
    printJson(buildSummary({
      status: payloadRead.status,
      payloadFile: payloadRead.safeFile || '<input>',
      payload: undefined,
      rows: [],
      noGoReasons: [issue(payloadRead.code)],
      warnings: [],
      exitCode: payloadRead.exitCode,
      mode: parsed.mode,
    }));
    process.exitCode = payloadRead.exitCode;
    return;
  }

  const rows = Array.isArray(payloadRead.value.rows) ? payloadRead.value.rows : [];
  const { errors, warnings } = validatePayload(payloadRead.value, parsed.mode);
  const status = errors.length > 0 ? 'NO-GO' : 'PASS';
  const exitCode = EXIT_CODES[status];

  printJson(buildSummary({
    status,
    payloadFile: payloadRead.safeFile,
    payload: payloadRead.value,
    rows,
    noGoReasons: errors,
    warnings,
    exitCode,
    mode: parsed.mode,
  }));
  process.exitCode = exitCode;
}

await main();
