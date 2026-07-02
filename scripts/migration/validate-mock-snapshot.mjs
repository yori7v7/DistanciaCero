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

const ALLOWED_ITEM_TYPES = new Set([
  'monthlyLetter',
  'openWhenLetter',
  'reason',
  'promise',
  'importantDate',
  'wishlistItem',
  'diaryEntry',
  'blackHoleGalleryItem',
  'playlistItem',
]);

const SECRET_PATTERNS = Object.freeze([
  {
    code: 'supabase_url',
    pattern: /https?:\/\/[a-z0-9-]+\.supabase\.co/i,
  },
  {
    code: 'project_ref_like',
    pattern: /\b[a-z0-9]{20}\b/,
  },
  {
    code: 'publishable_or_secret_key',
    pattern: /\bsb_(publishable|secret)_[A-Za-z0-9_-]{16,}\b/,
  },
  {
    code: 'jwt_like_token',
    pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/,
  },
  {
    code: 'service_role_value',
    pattern: /\bservice[_-]role\b/i,
  },
  {
    code: 'password_value',
    pattern: /"password"\s*:\s*"(?!<)[^"]{3,}"/i,
  },
  {
    code: 'uuid_value',
    pattern: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b/,
  },
  {
    code: 'personal_email',
    pattern: /\b[A-Za-z0-9._%+-]+@(?!example\.invalid\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  },
  {
    code: 'private_absolute_path',
    pattern: /([A-Za-z]:\\Users\\[^\s"'<>]+|\/Users\/[^\s"'<>]+|\/home\/[^\s"'<>]+)/,
  },
  {
    code: 'access_or_refresh_token_key',
    pattern: /"?(access_token|refresh_token)"?\s*:/i,
  },
]);

function usage() {
  return [
    `Usage: node scripts/migration/${SCRIPT_NAME} <local-mock-snapshot.json>`,
    'Input must be a local sanitized mock JSON file inside this repository.',
  ];
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
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

function isRemoteInput(value) {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readCount(counts, key) {
  return typeof counts[key] === 'number' ? counts[key] : undefined;
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

function countContentItems(content) {
  return EXPECTED_CONTENT_COLLECTIONS.reduce((total, key) => {
    const items = Array.isArray(content?.[key]) ? content[key] : [];
    return total + items.length;
  }, 0);
}

function validateWarningShape(snapshot, errors) {
  if (!Array.isArray(snapshot.warnings)) {
    addIssue(errors, 'warnings_not_array', '`warnings` must be an array.');
    return;
  }

  snapshot.warnings.forEach((warning, index) => {
    if (!isPlainObject(warning)) {
      addIssue(errors, 'warning_not_object', 'Warning entry must be an object.', `warnings[${index}]`);
      return;
    }
    if (typeof warning.type !== 'string' || warning.type.trim() === '') {
      addIssue(errors, 'warning_type_missing', 'Warning entry needs a string `type`.', `warnings[${index}]`);
    }
    if ('message' in warning && typeof warning.message !== 'string') {
      addIssue(errors, 'warning_message_invalid', 'Warning `message` must be a string when present.', `warnings[${index}]`);
    }
  });
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
        addIssue(errors, 'content_item_data_missing', 'Content item needs a data payload.', ref);
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
    const ref = `media[${index}]`;
    if (!isPlainObject(asset)) {
      addIssue(errors, 'media_asset_invalid', 'Media entry must be an object.', ref);
      return;
    }
    if (asset.storageStatus !== 'not_uploaded') {
      addIssue(errors, 'media_storage_status_invalid', 'Media storageStatus must be not_uploaded.', ref);
    }
  });
}

function validateCounts(snapshot, errors) {
  if (!isPlainObject(snapshot.counts)) {
    return;
  }

  const counts = snapshot.counts;
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
    const actual = readCount(counts, key);
    if (actual === undefined) {
      addIssue(errors, 'count_missing', `counts.${key} is missing.`, key);
    } else if (actual !== expected) {
      addIssue(errors, 'count_mismatch', `counts.${key} expected ${expected} but found ${actual}.`, key);
    }
  }
}

function validateLocalState(snapshot, errors) {
  if (!isPlainObject(snapshot.localState)) {
    return;
  }

  for (const key of EXPECTED_LOCAL_STATE_ARRAYS) {
    if (!Array.isArray(snapshot.localState[key])) {
      addIssue(errors, 'local_state_array_missing', `localState.${key} must be an array.`, key);
    }
  }
}

function summarizeCounts(snapshot) {
  const counts = isPlainObject(snapshot.counts) ? snapshot.counts : {};
  return {
    identities: readCount(counts, 'identities') ?? 0,
    contentItems: isPlainObject(snapshot.content) ? countContentItems(snapshot.content) : 0,
    media: readCount(counts, 'media') ?? 0,
    warnings: Array.isArray(snapshot.warnings) ? snapshot.warnings.length : 0,
  };
}

function classify(snapshot, validationErrors) {
  if (validationErrors.length > 0) {
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

function printReport({ file, result, counts, warnings, errors, exitCode }) {
  console.log('Mock snapshot validation');
  console.log(`script: ${SCRIPT_NAME}`);
  console.log(`file: ${file}`);
  console.log(`result: ${result}`);
  console.log(`counts: ${JSON.stringify(counts)}`);
  console.log(`warnings count: ${warnings.length}`);
  console.log(`errors count: ${errors.length}`);

  if (warnings.length > 0) {
    console.log('warnings:');
    for (const warning of warnings.slice(0, 10)) {
      const ref = warning.localRef ? ` (${warning.localRef})` : '';
      console.log(`- ${warning.type || 'warning'}${ref}`);
    }
  }

  if (errors.length > 0) {
    console.log('errors:');
    for (const error of errors.slice(0, 10)) {
      const ref = error.ref ? ` (${error.ref})` : '';
      console.log(`- ${error.code}${ref}: ${error.message}`);
    }
  }

  console.log(`exit code: ${exitCode}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    const exitCode = EXIT_CODES.INVALID_USAGE;
    console.log('Mock snapshot validation');
    console.log(`script: ${SCRIPT_NAME}`);
    console.log('result: INVALID_USAGE');
    for (const line of usage()) {
      console.log(line);
    }
    console.log(`exit code: ${exitCode}`);
    process.exitCode = exitCode;
    return;
  }

  const input = args[0];
  if (isRemoteInput(input)) {
    const exitCode = EXIT_CODES.INVALID_USAGE;
    printReport({
      file: '<remote-input-rejected>',
      result: 'INVALID_USAGE',
      counts: { identities: 0, contentItems: 0, media: 0, warnings: 0 },
      warnings: [],
      errors: [{ code: 'remote_input_rejected', message: 'Remote URLs are not accepted as input.' }],
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  if (input.includes('.env.local')) {
    const exitCode = EXIT_CODES.ABORTED;
    printReport({
      file: '<env-file-rejected>',
      result: 'ABORTED',
      counts: { identities: 0, contentItems: 0, media: 0, warnings: 0 },
      warnings: [],
      errors: [{ code: 'env_file_rejected', message: '.env.local input is forbidden.' }],
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  const resolvedPath = path.resolve(process.cwd(), input);
  const safeFile = sanitizePathForOutput(resolvedPath);

  if (!isInsideRepository(resolvedPath)) {
    const exitCode = EXIT_CODES.ABORTED;
    printReport({
      file: safeFile,
      result: 'ABORTED',
      counts: { identities: 0, contentItems: 0, media: 0, warnings: 0 },
      warnings: [],
      errors: [{ code: 'outside_repository_rejected', message: 'Input must stay inside this repository.' }],
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  let rawText;
  try {
    rawText = await readFile(resolvedPath, 'utf8');
  } catch {
    const exitCode = EXIT_CODES.INVALID_USAGE;
    printReport({
      file: safeFile,
      result: 'INVALID_USAGE',
      counts: { identities: 0, contentItems: 0, media: 0, warnings: 0 },
      warnings: [],
      errors: [{ code: 'file_not_found_or_unreadable', message: 'Input file does not exist or cannot be read.' }],
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  const securityFindings = scanForSecrets(rawText);
  if (securityFindings.length > 0) {
    const exitCode = EXIT_CODES.ABORTED;
    printReport({
      file: safeFile,
      result: 'ABORTED',
      counts: { identities: 0, contentItems: 0, media: 0, warnings: 0 },
      warnings: [],
      errors: securityFindings,
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
    printReport({
      file: safeFile,
      result: 'INVALID_USAGE',
      counts: { identities: 0, contentItems: 0, media: 0, warnings: 0 },
      warnings: [],
      errors: [{ code: 'invalid_json', message: 'Input file is not valid JSON.' }],
      exitCode,
    });
    process.exitCode = exitCode;
    return;
  }

  const errors = [];
  validateRequiredBlocks(snapshot, errors);
  validateWarningShape(snapshot, errors);
  validateLocalState(snapshot, errors);
  validateContent(snapshot, errors);
  validateMedia(snapshot, errors);
  validateCounts(snapshot, errors);

  const result = classify(snapshot, errors);
  const exitCode = EXIT_CODES[result];
  printReport({
    file: safeFile,
    result,
    counts: summarizeCounts(snapshot),
    warnings: Array.isArray(snapshot.warnings) ? snapshot.warnings : [],
    errors,
    exitCode,
  });
  process.exitCode = exitCode;
}

await main();
