import { spawnSync } from 'child_process';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const SCRIPT_FILE = fileURLToPath(import.meta.url);
const SCRIPT_DIR = path.dirname(SCRIPT_FILE);
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..', '..');
const SCRIPT_NAME = path.basename(SCRIPT_FILE);

const CASES = Object.freeze([
  {
    script: 'validate-mock-snapshot.mjs',
    label: 'validator PASS fixture',
    args: ['fixtures/mock-snapshot-pass.json'],
    expected: [0],
  },
  {
    script: 'validate-mock-snapshot.mjs',
    label: 'validator CHECK fixture',
    args: ['fixtures/mock-snapshot-check.json'],
    expected: [2],
  },
  {
    script: 'validate-mock-snapshot.mjs',
    label: 'validator NO-GO fixture',
    args: ['fixtures/mock-snapshot-nogo.json'],
    expected: [1, 4],
  },
  {
    script: 'dry-run-mock-snapshot.mjs',
    label: 'dry-run PASS fixture',
    args: ['fixtures/mock-snapshot-pass.json'],
    expected: [0],
  },
  {
    script: 'dry-run-mock-snapshot.mjs',
    label: 'dry-run CHECK fixture',
    args: ['fixtures/mock-snapshot-check.json'],
    expected: [2],
  },
  {
    script: 'dry-run-mock-snapshot.mjs',
    label: 'dry-run NO-GO fixture',
    args: ['fixtures/mock-snapshot-nogo.json'],
    expected: [1, 4],
  },
  {
    script: 'validate-mock-snapshot.mjs',
    label: 'validator invalid usage',
    args: [],
    expected: [5],
  },
  {
    script: 'dry-run-mock-snapshot.mjs',
    label: 'dry-run invalid usage',
    args: [],
    expected: [5],
  },
]);

function toRepoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
}

function expectedLabel(expected) {
  return expected.length === 1 ? String(expected[0]) : expected.join('/');
}

function runCase(testCase) {
  const scriptPath = path.join(SCRIPT_DIR, testCase.script);
  const args = [
    scriptPath,
    ...testCase.args.map((arg) => path.join(SCRIPT_DIR, arg)),
  ];

  const result = spawnSync(process.execPath, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });

  if (result.error) {
    return {
      script: testCase.script,
      label: testCase.label,
      expected: expectedLabel(testCase.expected),
      actual: 'runner-error',
      ok: false,
    };
  }

  const actual = typeof result.status === 'number' ? result.status : 'no-exit-code';
  return {
    script: toRepoRelative(scriptPath),
    label: testCase.label,
    expected: expectedLabel(testCase.expected),
    actual,
    ok: testCase.expected.includes(actual),
  };
}

function printResult(result) {
  const status = result.ok ? 'PASS' : 'FAIL';
  console.log(
    `- ${status} | script=${result.script} | case=${result.label} | expected=${result.expected} | actual=${result.actual}`,
  );
}

function main() {
  console.log('Mock migration smoke checks');
  console.log(`runner: ${SCRIPT_NAME}`);
  console.log('scope: mock-only');
  console.log('network: none');
  console.log('supabase: none');

  const results = CASES.map(runCase);
  for (const result of results) {
    printResult(result);
  }

  const failures = results.filter((result) => !result.ok);
  console.log(`checks total: ${results.length}`);
  console.log(`checks passed: ${results.length - failures.length}`);
  console.log(`checks failed: ${failures.length}`);

  if (failures.length > 0) {
    console.log('result: FAIL');
    console.log('exit code: 1');
    process.exitCode = 1;
    return;
  }

  console.log('result: PASS');
  console.log('exit code: 0');
  process.exitCode = 0;
}

try {
  main();
} catch {
  console.log('Mock migration smoke checks');
  console.log(`runner: ${SCRIPT_NAME}`);
  console.log('result: INVALID_USAGE');
  console.log('exit code: 5');
  process.exitCode = 5;
}
