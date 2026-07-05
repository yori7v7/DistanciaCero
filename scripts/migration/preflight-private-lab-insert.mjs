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
  ABORTED: 4,
  INVALID_USAGE: 5,
});

const REQUIRED_FLAGS = new Set([
  '--confirm-lab-disposable',
  '--confirm-no-production',
  '--confirm-no-storage',
  '--confirm-no-insert',
]);

const EXPECTED_SELECTED_COUNTS = Object.freeze({
  monthlyLetters: 2,
  openWhenLetters: 2,
  reasons: 2,
  promises: 2,
  importantDates: 2,
  futureDreams: 2,
  timeline: 2,
});

const EXPECTED_DEFERRED_COUNTS = Object.freeze({
  blackHoleGallery: 2,
  playlist: 2,
});

const BLOCKED_SELECTED_TYPES = new Set(['gallery_item', 'playlist_item']);
const BLOCKED_SELECTED_WARNING_CODES = new Set([
  'media_pending_storage',
  'playlist_source_pending_review',
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
  { code: 'data_url', pattern: /data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/i },
]);

function usage() {
  return [
    `Usage: node scripts/migration/${SCRIPT_NAME} <manifest.json> <identity-mapping.json> --confirm-lab-disposable --confirm-no-production --confirm-no-storage --confirm-no-insert`,
    'Inputs must be explicit local JSON files. Remote URLs are rejected.',
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

function issue(code, ref = '<input>') {
  return { code, ref };
}

function summarizeIssues(issues) {
  return issues.slice(0, 30).map((item) => ({
    code: item.code || 'unknown_issue',
    ref: item.ref || '<input>',
  }));
}

function getCount(manifest, key) {
  if (typeof manifest[key] === 'number') return manifest[key];
  if (isPlainObject(manifest.counts) && typeof manifest.counts[key] === 'number') {
    return manifest.counts[key];
  }
  return undefined;
}

function getNoGoReasons(manifest) {
  if (Array.isArray(manifest.noGoReasons)) return manifest.noGoReasons;
  return [];
}

function countByCollection(items) {
  const counts = {};
  for (const item of items) {
    const key = item.sourceCollection || item.collection || '<unknown>';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function countsMatch(actual, expected) {
  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();
  if (actualKeys.length !== expectedKeys.length) return false;
  return expectedKeys.every((key) => actual[key] === expected[key]);
}

function getWarningCodes(item) {
  return Array.isArray(item.warningCodes)
    ? item.warningCodes.filter((code) => typeof code === 'string')
    : [];
}

function hasPolicyFalse(manifest, key) {
  return manifest[key] === false
    || (isPlainObject(manifest.policy) && manifest.policy[key] === false)
    || (isPlainObject(manifest.safety) && manifest.safety[key] === false);
}

function hasPolicyTrue(manifest, key) {
  return manifest[key] === true
    || (isPlainObject(manifest.policy) && manifest.policy[key] === true)
    || (isPlainObject(manifest.safety) && manifest.safety[key] === true);
}

function getExcludedTables(manifest) {
  if (isPlainObject(manifest.target) && Array.isArray(manifest.target.excludedTables)) {
    return manifest.target.excludedTables;
  }
  return [];
}

function validateManifest(manifest) {
  const errors = [];
  if (!isPlainObject(manifest)) return [issue('manifest_not_object')];

  if (typeof manifest.manifestVersion !== 'string' || manifest.manifestVersion.trim() === '') {
    errors.push(issue('manifest_version_missing'));
  }
  if (!['CHECK', 'PASS'].includes(manifest.manifestStatus)) {
    errors.push(issue('manifest_status_invalid'));
  }

  const selectedItemsCount = getCount(manifest, 'selectedItemsCount');
  const deferredItemsCount = getCount(manifest, 'deferredItemsCount');
  if (selectedItemsCount !== 14) errors.push(issue('selected_count_not_14'));
  if (deferredItemsCount !== 4) errors.push(issue('deferred_count_not_4'));

  const noGoReasons = getNoGoReasons(manifest);
  const noGoReasonsCount = typeof manifest.noGoReasonsCount === 'number'
    ? manifest.noGoReasonsCount
    : noGoReasons.length;
  if (noGoReasonsCount !== 0 || noGoReasons.length > 0) {
    errors.push(issue('no_go_reasons_present'));
  }

  if (!Array.isArray(manifest.selectedItems)) {
    errors.push(issue('selected_items_missing'));
  } else {
    if (manifest.selectedItems.length !== 14) errors.push(issue('selected_items_length_not_14'));
    const selectedCounts = countByCollection(manifest.selectedItems);
    if (!countsMatch(selectedCounts, EXPECTED_SELECTED_COUNTS)) {
      errors.push(issue('selected_collection_counts_invalid'));
    }

    for (const [index, item] of manifest.selectedItems.entries()) {
      const ref = `selectedItems[${index}]`;
      if (!isPlainObject(item)) {
        errors.push(issue('selected_item_not_object', ref));
        continue;
      }
      if (item.targetTable !== 'content_items') errors.push(issue('selected_target_not_content_items', ref));
      const remoteType = item.remoteType || item.type;
      if (BLOCKED_SELECTED_TYPES.has(remoteType)) errors.push(issue('selected_blocked_type', ref));
      if (item.status === 'pending_review') errors.push(issue('selected_pending_review', ref));
      const warningCodes = getWarningCodes(item);
      if (warningCodes.length > 0) errors.push(issue('selected_warning_codes_present', ref));
      if (warningCodes.some((code) => BLOCKED_SELECTED_WARNING_CODES.has(code))) {
        errors.push(issue('selected_media_or_playlist_warning', ref));
      }
    }
  }

  if (!Array.isArray(manifest.deferredItems)) {
    errors.push(issue('deferred_items_missing'));
  } else {
    if (manifest.deferredItems.length !== 4) errors.push(issue('deferred_items_length_not_4'));
    const deferredCounts = countByCollection(manifest.deferredItems);
    if (!countsMatch(deferredCounts, EXPECTED_DEFERRED_COUNTS)) {
      errors.push(issue('deferred_collection_counts_invalid'));
    }
  }

  const excludedTables = getExcludedTables(manifest);
  for (const expected of ['media_assets', 'storage', 'content_events']) {
    if (!excludedTables.includes(expected)) {
      errors.push(issue('excluded_table_missing', expected));
    }
  }

  if (!hasPolicyFalse(manifest, 'productionAllowed')) {
    errors.push(issue('production_not_explicitly_blocked'));
  }
  if (!hasPolicyTrue(manifest, 'labOnly')) {
    errors.push(issue('lab_only_not_confirmed'));
  }

  return errors;
}

function getIdentityEntries(mapping) {
  if (Array.isArray(mapping.identities)) return mapping.identities;
  if (isPlainObject(mapping.identities)) {
    return Object.entries(mapping.identities).map(([localIdentityKey, value]) => ({
      localIdentityKey,
      ...(isPlainObject(value) ? value : { remoteProfileRef: value }),
    }));
  }
  return [];
}

function validateIdentityMapping(mapping) {
  const errors = [];
  if (!isPlainObject(mapping)) return [issue('identity_mapping_not_object')];
  if (mapping.status !== 'confirmed' && mapping.identityMappingStatus !== 'confirmed') {
    errors.push(issue('identity_mapping_not_confirmed'));
  }

  const entries = getIdentityEntries(mapping);
  for (const requiredKey of ['local-yori', 'local-ale']) {
    const entry = entries.find((item) => item.localIdentityKey === requiredKey || item.identityKey === requiredKey);
    if (!entry) {
      errors.push(issue('identity_mapping_missing', requiredKey));
      continue;
    }
    if (entry.status !== 'confirmed') {
      errors.push(issue('identity_mapping_entry_not_confirmed', requiredKey));
    }
    const ref = entry.remoteProfileRef || entry.remoteProfileHint || entry.remoteProfileId;
    if (typeof ref !== 'string' || ref.trim() === '' || ref === '<private_mapping_required>') {
      errors.push(issue('identity_mapping_placeholder', requiredKey));
    }
  }

  return errors;
}

function buildReport({
  status,
  manifest,
  mapping,
  flags,
  noGoReasons,
  warnings,
  exitCode,
  manifestFile,
  identityMappingFile,
}) {
  const selectedItems = Array.isArray(manifest?.selectedItems) ? manifest.selectedItems : [];
  const deferredItems = Array.isArray(manifest?.deferredItems) ? manifest.deferredItems : [];
  return {
    preflightVersion: 'private-lab-insert-preflight-v1',
    generatedAt: new Date().toISOString(),
    preflightStatus: status,
    inputs: {
      manifestFile,
      identityMappingFile,
    },
    manifestStatus: manifest?.manifestStatus || '<unknown>',
    selectedItemsCount: getCount(manifest || {}, 'selectedItemsCount') ?? selectedItems.length,
    deferredItemsCount: getCount(manifest || {}, 'deferredItemsCount') ?? deferredItems.length,
    identityMappingStatus: mapping?.status || mapping?.identityMappingStatus || '<unknown>',
    labDisposableConfirmed: flags.has('--confirm-lab-disposable'),
    productionBlocked: flags.has('--confirm-no-production'),
    storageBlocked: flags.has('--confirm-no-storage'),
    insertBlocked: flags.has('--confirm-no-insert'),
    noNetwork: true,
    noSupabaseTouched: true,
    noInsertExecuted: true,
    allowedCollections: countByCollection(selectedItems),
    deferredCollections: countByCollection(deferredItems),
    noGoReasons: summarizeIssues(noGoReasons),
    warnings: summarizeIssues(warnings),
    nextRecommendedAction: nextAction(status),
    exitCode,
  };
}

function buildErrorReport({ status, code, exitCode, flags, manifestFile, identityMappingFile }) {
  return buildReport({
    status,
    manifest: {},
    mapping: {},
    flags,
    noGoReasons: [issue(code)],
    warnings: [],
    exitCode,
    manifestFile,
    identityMappingFile,
  });
}

function nextAction(status) {
  if (status === 'PASS') return 'review_preflight_report_before_any_private_use';
  if (status === 'NO-GO') return 'repair_manifest_or_identity_mapping_before_insert';
  if (status === 'ABORTED') return 'stop_and_remove_sensitive_input';
  return 'rerun_with_required_local_files_and_flags';
}

function printJson(report) {
  console.log(JSON.stringify(report, null, 2));
}

function validateArgs(args) {
  if (args.length !== 6) return { ok: false, code: 'invalid_argument_count' };
  const [manifestInput, identityInput, ...flagArgs] = args;
  if (isRemoteInput(manifestInput) || isRemoteInput(identityInput)) {
    return { ok: false, code: 'remote_input_rejected' };
  }
  if (manifestInput.includes('.env.local') || identityInput.includes('.env.local')) {
    return { ok: false, code: 'env_file_rejected', aborted: true };
  }
  const flags = new Set(flagArgs);
  if (flags.size !== flagArgs.length) return { ok: false, code: 'duplicate_flags' };
  for (const flag of flagArgs) {
    if (!REQUIRED_FLAGS.has(flag)) return { ok: false, code: 'unknown_flag' };
  }
  for (const flag of REQUIRED_FLAGS) {
    if (!flags.has(flag)) return { ok: false, code: 'required_flag_missing' };
  }
  return { ok: true, manifestInput, identityInput, flags };
}

async function readJsonInput(inputPath) {
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

async function main() {
  const args = process.argv.slice(2);
  const parsed = validateArgs(args);
  const emptyFlags = new Set();
  if (!parsed.ok) {
    const exitCode = parsed.aborted ? EXIT_CODES.ABORTED : EXIT_CODES.INVALID_USAGE;
    const status = parsed.aborted ? 'ABORTED' : 'INVALID_USAGE';
    printJson({
      ...buildErrorReport({
        status,
        code: parsed.code,
        exitCode,
        flags: emptyFlags,
        manifestFile: '<missing-or-invalid-input>',
        identityMappingFile: '<missing-or-invalid-input>',
      }),
      usage: usage(),
    });
    process.exitCode = exitCode;
    return;
  }

  const manifestRead = await readJsonInput(parsed.manifestInput);
  const identityRead = await readJsonInput(parsed.identityInput);
  const manifestFile = manifestRead.safeFile || '<input>';
  const identityMappingFile = identityRead.safeFile || '<input>';

  for (const result of [manifestRead, identityRead]) {
    if (!result.ok) {
      printJson(buildErrorReport({
        status: result.status,
        code: result.code,
        exitCode: result.exitCode,
        flags: parsed.flags,
        manifestFile,
        identityMappingFile,
      }));
      process.exitCode = result.exitCode;
      return;
    }
  }

  const manifestErrors = validateManifest(manifestRead.value);
  const mappingErrors = validateIdentityMapping(identityRead.value);
  const noGoReasons = [...manifestErrors, ...mappingErrors];
  const status = noGoReasons.length > 0 ? 'NO-GO' : 'PASS';
  const exitCode = EXIT_CODES[status];

  printJson(buildReport({
    status,
    manifest: manifestRead.value,
    mapping: identityRead.value,
    flags: parsed.flags,
    noGoReasons,
    warnings: [],
    exitCode,
    manifestFile,
    identityMappingFile,
  }));

  process.exitCode = exitCode;
}

await main();
