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

const EXPECTED_SELECTED_COUNTS = Object.freeze({
  monthlyLetters: 2,
  openWhenLetters: 2,
  reasons: 2,
  promises: 2,
  importantDates: 2,
  futureDreams: 2,
  timeline: 2,
});

const EXPECTED_DEFERRED_COUNT = 4;
const EXPECTED_SELECTED_COUNT = 14;

const SELECTABLE_TYPES = new Set([
  'monthly_letter',
  'open_when_letter',
  'reason',
  'promise',
  'important_date',
  'future_dream',
  'timeline_event',
]);

const BLOCKED_SELECTED_TYPES = new Set(['gallery_item', 'playlist_item']);
const BLOCKED_SELECTED_COLLECTIONS = new Set(['blackHoleGallery', 'playlist']);
const EXCLUDED_COLLECTIONS = Object.freeze(['blackHoleGallery', 'playlist']);
const EXCLUDED_TARGETS = Object.freeze(['media_assets', 'storage', 'content_events']);

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

const DATA_URL_PATTERN = /data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/i;
const URL_PATTERN = /https?:\/\//i;
const IDENTITY_PLACEHOLDER_PATTERN = /^<[^>]+>$/;

const IDENTITY_ALIASES = Object.freeze({
  yori: 'local-yori',
  local_yori: 'local-yori',
  diego: 'local-yori',
  owner_a: 'local-yori',
  local_owner_a: 'local-yori',
  synthetic_owner_a: 'local-yori',
  owner_a_sintetico: 'local-yori',
  ale: 'local-ale',
  local_ale: 'local-ale',
  partner_a: 'local-ale',
  local_partner_a: 'local-ale',
  synthetic_partner_a: 'local-ale',
  partner_a_sintetico: 'local-ale',
});

function usage() {
  return [
    `Usage: node scripts/migration/${SCRIPT_NAME} <export-v2.json> <manifest.json> <identity-mapping.json>`,
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

function sanitizeLocalRef(value) {
  const text = String(value ?? '<unknown>').trim();
  if (!text) return '<unknown>';
  const sanitized = text.replace(/[^\w:.[\]-]/g, '_');
  return sanitized.length > 80 ? `${sanitized.slice(0, 77)}...` : sanitized;
}

function normalizeIdentityLabel(value) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed || IDENTITY_PLACEHOLDER_PATTERN.test(trimmed)) return undefined;
  const normalized = trimmed
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return IDENTITY_ALIASES[normalized];
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

function countByCollection(items) {
  const counts = {};
  for (const item of items) {
    const key = item.sourceCollection || '<unknown>';
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

function scanForSecrets(rawText, { allowDataUrls = false } = {}) {
  const findings = [];
  for (const check of SECRET_PATTERNS) {
    if (check.pattern.test(rawText)) {
      findings.push({ code: check.code, ref: '<input>' });
    }
  }
  if (!allowDataUrls && DATA_URL_PATTERN.test(rawText)) {
    findings.push({ code: 'data_url', ref: '<input>' });
  }
  return findings;
}

function getCount(value, key) {
  if (typeof value?.[key] === 'number') return value[key];
  if (isPlainObject(value?.counts) && typeof value.counts[key] === 'number') {
    return value.counts[key];
  }
  return undefined;
}

function getNoGoReasons(manifest) {
  return Array.isArray(manifest?.noGoReasons) ? manifest.noGoReasons : [];
}

function getWarningCodes(item) {
  return Array.isArray(item?.warningCodes)
    ? item.warningCodes.filter((code) => typeof code === 'string')
    : [];
}

function getLocalRef(item, collection, index) {
  for (const key of ['id', 'localId', 'legacyId']) {
    const value = item?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return `${collection}[${index}]`;
}

function collectionItems(exportJson, collection) {
  const items = exportJson?.content?.[collection];
  return Array.isArray(items) ? items : [];
}

function buildExportIndex(exportJson) {
  const index = new Map();
  if (!isPlainObject(exportJson?.content)) return index;

  for (const [collection, items] of Object.entries(exportJson.content)) {
    if (!Array.isArray(items)) continue;
    items.forEach((item, itemIndex) => {
      if (!isPlainObject(item)) return;
      index.set(`${collection}::${getLocalRef(item, collection, itemIndex)}`, item);
    });
  }
  return index;
}

function containsDataUrl(value) {
  const text = JSON.stringify(value ?? {});
  return DATA_URL_PATTERN.test(text);
}

function containsUrl(value) {
  const text = JSON.stringify(value ?? {});
  return URL_PATTERN.test(text);
}

function validateExport(exportJson) {
  const errors = [];
  if (!isPlainObject(exportJson)) return [issue('export_not_object')];
  if (Number(exportJson.version) !== 2) errors.push(issue('export_version_not_2'));
  if (!isPlainObject(exportJson.content)) errors.push(issue('export_content_missing'));
  return errors;
}

function validateManifest(manifest) {
  const errors = [];
  if (!isPlainObject(manifest)) return [issue('manifest_not_object')];

  const selectedItems = Array.isArray(manifest.selectedItems) ? manifest.selectedItems : [];
  const deferredItems = Array.isArray(manifest.deferredItems) ? manifest.deferredItems : [];
  const selectedCount = getCount(manifest, 'selectedItemsCount');
  const deferredCount = getCount(manifest, 'deferredItemsCount');
  const noGoReasons = getNoGoReasons(manifest);
  const noGoReasonsCount = typeof manifest.noGoReasonsCount === 'number'
    ? manifest.noGoReasonsCount
    : noGoReasons.length;

  if (!Array.isArray(manifest.selectedItems)) errors.push(issue('manifest_selected_items_missing'));
  if (selectedCount !== EXPECTED_SELECTED_COUNT) errors.push(issue('selected_count_not_14'));
  if (selectedItems.length !== EXPECTED_SELECTED_COUNT) errors.push(issue('selected_items_length_not_14'));
  if (deferredCount !== EXPECTED_DEFERRED_COUNT) errors.push(issue('deferred_count_not_4'));
  if (deferredItems.length !== EXPECTED_DEFERRED_COUNT) errors.push(issue('deferred_items_length_not_4'));
  if (noGoReasonsCount !== 0 || noGoReasons.length > 0) errors.push(issue('no_go_reasons_present'));

  const selectedCounts = countByCollection(selectedItems);
  if (selectedItems.length > 0 && !countsMatch(selectedCounts, EXPECTED_SELECTED_COUNTS)) {
    errors.push(issue('selected_collection_counts_invalid'));
  }

  selectedItems.forEach((item, index) => {
    const ref = `selectedItems[${index}]`;
    if (!isPlainObject(item)) {
      errors.push(issue('selected_item_not_object', ref));
      return;
    }
    const warningCodes = getWarningCodes(item);
    const remoteType = item.remoteType || item.type;
    if (item.targetTable !== 'content_items') errors.push(issue('selected_target_not_content_items', ref));
    if (!SELECTABLE_TYPES.has(remoteType)) errors.push(issue('selected_type_not_allowed', ref));
    if (BLOCKED_SELECTED_TYPES.has(remoteType)) errors.push(issue('selected_media_or_playlist_type', ref));
    if (BLOCKED_SELECTED_COLLECTIONS.has(item.sourceCollection)) {
      errors.push(issue('selected_media_or_playlist_collection', ref));
    }
    if (item.status === 'pending_review') errors.push(issue('selected_pending_review', ref));
    if (warningCodes.length > 0) errors.push(issue('selected_warning_codes_present', ref));
    if (typeof item.localRef !== 'string' || item.localRef.trim() === '') {
      errors.push(issue('selected_local_ref_missing', ref));
    }
    if (typeof item.identityKey !== 'string' || item.identityKey.trim() === '') {
      errors.push(issue('selected_identity_key_missing', ref));
    }
  });

  return errors;
}

function getIdentityEntries(mapping) {
  if (Array.isArray(mapping?.identities)) return mapping.identities;
  if (isPlainObject(mapping?.identities)) {
    return Object.entries(mapping.identities).map(([localIdentityKey, value]) => ({
      localIdentityKey,
      ...(isPlainObject(value) ? value : { remoteProfileRef: value }),
    }));
  }
  return [];
}

function buildIdentityMap(mapping) {
  const entries = getIdentityEntries(mapping);
  const identityMap = new Map();
  for (const entry of entries) {
    const key = entry.localIdentityKey || entry.identityKey;
    if (typeof key === 'string' && key.trim()) {
      identityMap.set(key, entry);
    }
  }
  return identityMap;
}

function validateIdentityMapping(mapping) {
  const errors = [];
  if (!isPlainObject(mapping)) return [issue('identity_mapping_not_object')];
  if (mapping.status !== 'confirmed' && mapping.identityMappingStatus !== 'confirmed') {
    errors.push(issue('identity_mapping_not_confirmed'));
  }

  for (const entry of getIdentityEntries(mapping)) {
    if (entry.status !== 'confirmed') {
      errors.push(issue('identity_mapping_entry_not_confirmed', '<identity_mapping>'));
    }
    const ref = entry.remoteProfileRef || entry.remoteProfileHint || entry.remoteProfileId;
    if (typeof ref !== 'string' || ref.trim() === '' || ref === '<private_mapping_required>') {
      errors.push(issue('identity_mapping_placeholder', '<identity_mapping>'));
    }
  }

  return errors;
}

function candidateValuesFromMetadata(metadata, keys) {
  if (!isPlainObject(metadata)) return [];
  return keys.map((key) => metadata[key]);
}

function inferLocalIdentity(item, manifestItem) {
  const candidates = [
    manifestItem?.identityKey,
    item?.createdBy,
    item?.updatedBy,
    item?.created_by,
    item?.updated_by,
    ...candidateValuesFromMetadata(item?.metadata, [
      'createdBy',
      'updatedBy',
      'created_by',
      'updated_by',
      'author',
      'identity',
      'localIdentity',
      'localIdentityKey',
      'identityKey',
    ]),
    item?.localIdentity,
    item?.localIdentityKey,
    item?.identity,
    item?.identityKey,
    item?.author,
    item?.source,
  ];

  for (const value of candidates) {
    const normalized = normalizeIdentityLabel(value);
    if (normalized) return normalized;
  }
  return undefined;
}

function inferActorIdentity(item, manifestItem, actor) {
  const fieldNames = actor === 'created'
    ? ['createdBy', 'created_by']
    : ['updatedBy', 'updated_by'];
  const candidates = [
    ...fieldNames.map((field) => item?.[field]),
    ...candidateValuesFromMetadata(item?.metadata, fieldNames),
    inferLocalIdentity(item, manifestItem),
  ];

  for (const value of candidates) {
    const normalized = normalizeIdentityLabel(value);
    if (normalized) return normalized;
  }
  return undefined;
}

function validateMappedIdentity(identityMap, identity, ref, errors) {
  if (!identity) {
    errors.push(issue('identity_mapping_missing', ref));
    return;
  }
  const entry = identityMap.get(identity);
  if (!entry) {
    errors.push(issue('identity_mapping_missing', ref));
    return;
  }
  if (entry.status !== 'confirmed') {
    errors.push(issue('identity_mapping_entry_not_confirmed', ref));
  }
  const remoteRef = entry.remoteProfileRef || entry.remoteProfileHint || entry.remoteProfileId;
  if (typeof remoteRef !== 'string' || remoteRef.trim() === '' || remoteRef === '<private_mapping_required>') {
    errors.push(issue('identity_mapping_placeholder', ref));
  }
}

function buildIdentityStats({ exportIndex, manifest }) {
  const selectedItems = Array.isArray(manifest?.selectedItems) ? manifest.selectedItems : [];
  let identityResolvedCount = 0;
  let identityMissingCount = 0;

  for (const item of selectedItems) {
    const exportItem = exportIndex.get(`${item.sourceCollection}::${item.localRef}`);
    if (!exportItem) continue;
    if (inferLocalIdentity(exportItem, item)) {
      identityResolvedCount += 1;
    } else {
      identityMissingCount += 1;
    }
  }

  return { identityResolvedCount, identityMissingCount };
}

function validateSelectedPayloads({ exportIndex, manifest, identityMap }) {
  const errors = [];
  const selectedItems = Array.isArray(manifest?.selectedItems) ? manifest.selectedItems : [];

  for (const item of selectedItems) {
    const collection = item.sourceCollection;
    const localRef = item.localRef;
    const ref = sanitizeLocalRef(`${collection}:${localRef}`);
    const exportItem = exportIndex.get(`${collection}::${localRef}`);
    if (!exportItem) {
      errors.push(issue('selected_local_ref_not_found', ref));
      continue;
    }

    if (containsDataUrl(exportItem)) {
      errors.push(issue('selected_data_url_detected', ref));
    }
    if (containsUrl(exportItem)) {
      errors.push(issue('selected_url_detected', ref));
    }

    const primaryIdentity = inferLocalIdentity(exportItem, item);
    const createdBy = inferActorIdentity(exportItem, item, 'created') || primaryIdentity;
    const updatedBy = inferActorIdentity(exportItem, item, 'updated') || primaryIdentity;
    if (!primaryIdentity) {
      errors.push(issue('identity_mapping_missing', ref));
      continue;
    }
    for (const identity of new Set([primaryIdentity, createdBy, updatedBy].filter(Boolean))) {
      validateMappedIdentity(identityMap, identity, ref, errors);
    }
  }

  return errors;
}

function buildPayloadRows({ exportIndex, manifest, identityMap }) {
  return manifest.selectedItems.map((item) => {
    const exportItem = exportIndex.get(`${item.sourceCollection}::${item.localRef}`);
    const primaryIdentity = inferLocalIdentity(exportItem, item);
    const createdBy = inferActorIdentity(exportItem, item, 'created') || primaryIdentity;
    const updatedBy = inferActorIdentity(exportItem, item, 'updated') || primaryIdentity;
    const createdMapping = identityMap.get(createdBy);
    const updatedMapping = identityMap.get(updatedBy);

    return {
      targetTable: 'content_items',
      type: item.remoteType,
      sourceCollection: item.sourceCollection,
      sourceLocalRef: sanitizeLocalRef(item.localRef),
      identityKey: primaryIdentity,
      mappedCreatedBy: createdMapping.remoteProfileRef || createdMapping.remoteProfileHint,
      mappedUpdatedBy: updatedMapping.remoteProfileRef || updatedMapping.remoteProfileHint,
      migrationRunId: '<future_migration_run_id>',
      payload: {
        sourceCollection: item.sourceCollection,
        sourceLocalRef: sanitizeLocalRef(item.localRef),
        mockPayload: exportItem,
      },
    };
  });
}

function buildSummary({
  status,
  exportFile,
  manifestFile,
  identityMappingFile,
  selectedItemsCount,
  payloadRowsCount,
  deferredItemsCount,
  rowsByCollection,
  identityResolvedCount,
  identityMissingCount,
  identityMappingStatus,
  noGoReasons,
  exitCode,
}) {
  return {
    payloadBuildVersion: 'private-insert-payload-builder-v1',
    generatedAt: new Date().toISOString(),
    payloadBuildStatus: status,
    source: {
      exportFile,
      manifestFile,
      identityMappingFile,
    },
    selectedItemsCount,
    payloadRowsCount,
    deferredItemsCount,
    excludedCollections: EXCLUDED_COLLECTIONS,
    missingLocalRefsCount: noGoReasons.filter((item) => item.code === 'selected_local_ref_not_found').length,
    noGoReasonsCount: noGoReasons.length,
    rowsByCollection,
    identityResolvedCount,
    identityMissingCount,
    identityMappingStatus,
    targetTable: 'content_items',
    excludedTargets: EXCLUDED_TARGETS,
    noSupabaseTouched: true,
    noInsertExecuted: true,
    noNetwork: true,
    payloadPrinted: false,
    nextRecommendedAction: nextRecommendedAction(status),
    noGoReasons: summarizeIssues(noGoReasons),
    exitCode,
  };
}

function buildErrorSummary({ status, code, exportFile, manifestFile, identityMappingFile, exitCode }) {
  return buildSummary({
    status,
    exportFile,
    manifestFile,
    identityMappingFile,
    selectedItemsCount: 0,
    payloadRowsCount: 0,
    deferredItemsCount: 0,
    rowsByCollection: {},
    identityResolvedCount: 0,
    identityMissingCount: 0,
    identityMappingStatus: '<unknown>',
    noGoReasons: [issue(code)],
    exitCode,
  });
}

function nextRecommendedAction(status) {
  if (status === 'PASS') return 'review_sanitized_payload_build_summary_before_private_use';
  if (status === 'NO-GO') return 'repair_export_manifest_or_identity_mapping_before_payload_build';
  if (status === 'ABORTED') return 'stop_and_remove_sensitive_input';
  return 'rerun_with_three_explicit_local_json_files';
}

function printJson(report) {
  console.log(JSON.stringify(report, null, 2));
}

function printUsage(exitCode) {
  printJson({
    ...buildErrorSummary({
      status: 'INVALID_USAGE',
      code: 'invalid_argument_count',
      exportFile: '<missing-input>',
      manifestFile: '<missing-input>',
      identityMappingFile: '<missing-input>',
      exitCode,
    }),
    usage: usage(),
  });
}

function validateArgs(args) {
  if (args.length !== 3) return { ok: false, code: 'invalid_argument_count' };
  const [exportInput, manifestInput, identityInput] = args;
  if ([exportInput, manifestInput, identityInput].some(isRemoteInput)) {
    return { ok: false, code: 'remote_input_rejected' };
  }
  if ([exportInput, manifestInput, identityInput].some((input) => input.includes('.env.local'))) {
    return { ok: false, code: 'env_file_rejected', aborted: true };
  }
  return { ok: true, exportInput, manifestInput, identityInput };
}

async function readJsonInput(inputPath, options = {}) {
  const resolvedPath = path.resolve(process.cwd(), inputPath);
  const safeFile = sanitizePathForOutput(resolvedPath);

  let rawText;
  try {
    rawText = await readFile(resolvedPath, 'utf8');
  } catch {
    return { ok: false, safeFile, status: 'INVALID_USAGE', exitCode: EXIT_CODES.INVALID_USAGE, code: 'file_unreadable' };
  }

  const securityFindings = scanForSecrets(rawText, options);
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
  const parsed = validateArgs(process.argv.slice(2));
  if (!parsed.ok) {
    const status = parsed.aborted ? 'ABORTED' : 'INVALID_USAGE';
    const exitCode = parsed.aborted ? EXIT_CODES.ABORTED : EXIT_CODES.INVALID_USAGE;
    if (parsed.code === 'invalid_argument_count') {
      printUsage(exitCode);
    } else {
      printJson(buildErrorSummary({
        status,
        code: parsed.code,
        exportFile: '<missing-or-invalid-input>',
        manifestFile: '<missing-or-invalid-input>',
        identityMappingFile: '<missing-or-invalid-input>',
        exitCode,
      }));
    }
    process.exitCode = exitCode;
    return;
  }

  const exportRead = await readJsonInput(parsed.exportInput, { allowDataUrls: true });
  const manifestRead = await readJsonInput(parsed.manifestInput);
  const identityRead = await readJsonInput(parsed.identityInput);
  const exportFile = exportRead.safeFile || '<input>';
  const manifestFile = manifestRead.safeFile || '<input>';
  const identityMappingFile = identityRead.safeFile || '<input>';

  for (const result of [exportRead, manifestRead, identityRead]) {
    if (!result.ok) {
      printJson(buildErrorSummary({
        status: result.status,
        code: result.code,
        exportFile,
        manifestFile,
        identityMappingFile,
        exitCode: result.exitCode,
      }));
      process.exitCode = result.exitCode;
      return;
    }
  }

  const exportErrors = validateExport(exportRead.value);
  const manifestErrors = validateManifest(manifestRead.value);
  const identityErrors = validateIdentityMapping(identityRead.value);
  const exportIndex = buildExportIndex(exportRead.value);
  const identityMap = buildIdentityMap(identityRead.value);
  const payloadErrors = exportErrors.length === 0 && manifestErrors.length === 0 && identityErrors.length === 0
    ? validateSelectedPayloads({ exportIndex, manifest: manifestRead.value, identityMap })
    : [];
  const noGoReasons = [...exportErrors, ...manifestErrors, ...identityErrors, ...payloadErrors];
  const status = noGoReasons.length > 0 ? 'NO-GO' : 'PASS';
  const exitCode = EXIT_CODES[status];
  const payloadRows = status === 'PASS'
    ? buildPayloadRows({ exportIndex, manifest: manifestRead.value, identityMap })
    : [];

  printJson(buildSummary({
    status,
    exportFile,
    manifestFile,
    identityMappingFile,
    selectedItemsCount: getCount(manifestRead.value, 'selectedItemsCount') ?? 0,
    payloadRowsCount: payloadRows.length,
    deferredItemsCount: getCount(manifestRead.value, 'deferredItemsCount') ?? 0,
    rowsByCollection: countByCollection(payloadRows),
    ...buildIdentityStats({ exportIndex, manifest: manifestRead.value }),
    identityMappingStatus: identityRead.value?.status || identityRead.value?.identityMappingStatus || '<unknown>',
    noGoReasons,
    exitCode,
  }));

  process.exitCode = exitCode;
}

await main();
