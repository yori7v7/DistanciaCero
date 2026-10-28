import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const checks = [
  ['TypeScript', 'node_modules/typescript/bin/tsc', ['--noEmit']],
  ['Recursos configurados', 'scripts/check-resources.mjs', []],
  ['Pruebas unitarias', 'node_modules/vitest/vitest.mjs', ['run']],
  ['Build local', 'node_modules/vite/bin/vite.js', ['build']]
]

for (const [label, cliPath, args] of checks) {
  console.log(`\n${label}`)
  const result = spawnSync(
    process.execPath,
    [fileURLToPath(new URL(`../${cliPath}`, import.meta.url)), ...args],
    {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, VITE_REMOTE_CONTENT_ENABLED: 'false' }
    }
  )

  if (result.error) {
    console.error(`No se pudo iniciar ${label}: ${result.error.message}`)
    process.exit(1)
  }

  if (result.status !== 0) process.exit(result.status ?? 1)
}
