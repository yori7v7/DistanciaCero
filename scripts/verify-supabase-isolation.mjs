import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const factoryPath = 'src/integrations/supabase/client.js'
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx'])
const results = { repository: [], factory: [], runtime: [] }

const requiredFunctions = Object.freeze(`
  getCollectionItems saveCollectionItems addCollectionItem
  updateCollectionItem deleteCollectionItem getCollectionOverrides
  saveCollectionOverrides setCollectionOverride deleteCollectionOverride
  getCollectionHiddenIds saveCollectionHiddenIds hideCollectionItem
  restoreCollectionItem
`.trim().split(/\s+/))

const localOnlyFunctions = Object.freeze(`
  mergeCollectionWithLocal getLegacyMonthlyLetters saveLegacyMonthlyLetters
  getLegacyOpenWhenLetters saveLegacyOpenWhenLetters isMonthlyLetterOpened
  setMonthlyLetterOpened isOpenWhenLetterOpened setOpenWhenLetterOpened
  getSimulationUnlocked setSimulationUnlocked
`.trim().split(/\s+/))

const contentServiceFunctions = Object.freeze([
  ...requiredFunctions,
  ...localOnlyFunctions,
  'notifyContentUpdated',
  'notifyAllContentUpdated'
])

const syntheticValues = Object.freeze({
  publishableUrl: 'https://synthetic-project.supabase.invalid',
  anonUrl: 'https://synthetic-anon.supabase.invalid',
  publishableKey: 'synthetic-publishable-key',
  anonKey: 'synthetic-anon-key',
  collection: 'private-collection-sentinel',
  id: 'private-id-sentinel',
  payload: 'private-payload-sentinel'
})

function expect(condition, message) {
  if (!condition) throw new Error(message)
}

function redact(error) {
  let message = error instanceof Error ? error.message : String(error)
  for (const value of Object.values(syntheticValues)) {
    message = message.replaceAll(value, '[redacted]')
  }
  return message.replace(/https?:\/\/\S+/gi, '[redacted-url]')
}

async function check(section, label, verify) {
  try {
    await verify()
    results[section].push({ label, passed: true })
  } catch (error) {
    results[section].push({ label, passed: false, error: redact(error) })
  }
}

function absolute(relativePath) {
  return path.join(root, ...relativePath.split('/'))
}

function moduleUrl(relativePath) {
  return pathToFileURL(absolute(relativePath)).href
}

async function source(relativePath) {
  return readFile(absolute(relativePath), 'utf8')
}

async function walk(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(entryPath))
    else if (sourceExtensions.has(path.extname(entry.name))) files.push(entryPath)
  }
  return files
}

function sameArray(actual, expected) {
  return actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, '/')
}

function matchingFiles(sourceFiles, pattern) {
  return sourceFiles
    .filter((file) => {
      pattern.lastIndex = 0
      return pattern.test(file.source)
    })
    .map((file) => file.path)
    .sort()
}

function expectFactoryOnly(sourceFiles, pattern, label) {
  expect(
    sameArray(matchingFiles(sourceFiles, pattern), [factoryPath]),
    `${label} escaped the factory allowlist`
  )
}

const originalFetch = globalThis.fetch
let fetchCalls = 0
globalThis.fetch = () => {
  fetchCalls += 1
  return Promise.resolve(
    new Response(null, { status: 599, statusText: 'Blocked by verifier' })
  )
}

async function verifyRepository() {
  let contract
  let remote

  await check('repository', 'Repository contract modules import safely', async () => {
    contract = await import(moduleUrl('src/repositories/contentRepositoryContract.js'))
    remote = await import(moduleUrl('src/repositories/remoteContentRepository.js'))
  })
  if (!contract || !remote) return

  const required = contract.REQUIRED_REMOTE_REPOSITORY_FUNCTIONS
  const localOnly = contract.LOCAL_ONLY_REPOSITORY_FUNCTIONS
  const repository = remote.remoteContentRepository

  await check('repository', 'Required remote function list is exact and frozen', () => {
    expect(sameArray(required, requiredFunctions), 'Required function list changed')
    expect(Object.isFrozen(required), 'Required function list is mutable')
  })
  await check('repository', 'Local-only function list is exact and frozen', () => {
    expect(sameArray(localOnly, localOnlyFunctions), 'Local-only function list changed')
    expect(Object.isFrozen(localOnly), 'Local-only function list is mutable')
  })
  await check('repository', 'Remote repository remains inactive and frozen', () => {
    expect(remote.REMOTE_REPOSITORY_IMPLEMENTED === false, 'Remote repository is active')
    expect(Object.isFrozen(repository), 'Remote repository object is mutable')
  })
  await check('repository', 'Remote repository satisfies its structural contract', () => {
    expect(contract.getMissingRepositoryFunctions(repository).length === 0, 'Missing functions')
    expect(contract.assertRepositoryContract(repository) === repository, 'Assertion changed object')
  })

  for (const operation of required) {
    await check('repository', `${operation} is sync and fail-fast`, () => {
      const operationFunction = repository[operation]
      expect(typeof operationFunction === 'function', 'Operation is not a function')
      expect(operationFunction.constructor.name !== 'AsyncFunction', 'Operation became async')

      let thrown = null
      try {
        operationFunction(
          syntheticValues.collection,
          syntheticValues.id,
          { value: syntheticValues.payload }
        )
      } catch (error) {
        thrown = error
      }

      expect(thrown instanceof remote.RemoteRepositoryNotImplementedError, 'Wrong error type')
      expect(thrown.code === 'REMOTE_REPOSITORY_NOT_IMPLEMENTED', 'Wrong error code')
      expect(thrown.operation === operation, 'Wrong error operation')
      expect(
        ![syntheticValues.collection, syntheticValues.id, syntheticValues.payload]
          .some((value) => thrown.message.includes(value)),
        'Error exposed operation arguments'
      )
    })
  }
}

async function verifyFactory() {
  let factory
  const fetchesBeforeImport = fetchCalls

  await check('factory', 'Supabase factory imports safely without fetch', async () => {
    factory = await import(moduleUrl(factoryPath))
    expect(fetchCalls === fetchesBeforeImport, 'Factory import attempted fetch')
  })
  if (!factory) return

  const publishableEnv = {
    VITE_REMOTE_CONTENT_ENABLED: 'true',
    VITE_SUPABASE_URL: syntheticValues.publishableUrl,
    VITE_SUPABASE_PUBLISHABLE_KEY: syntheticValues.publishableKey
  }
  const anonEnv = {
    VITE_REMOTE_CONTENT_ENABLED: 'true',
    VITE_SUPABASE_URL: syntheticValues.anonUrl,
    VITE_SUPABASE_ANON_KEY: syntheticValues.anonKey
  }

  await check('factory', 'Factory implementation marker is enabled', () => {
    expect(factory.SUPABASE_CLIENT_FACTORY_IMPLEMENTED === true, 'Factory marker is not true')
  })
  await check('factory', 'Remote flag requires the exact string true', () => {
    expect(factory.isRemoteContentEnabled({}) === false, 'Missing flag enabled remote')
    expect(factory.isRemoteContentEnabled({ VITE_REMOTE_CONTENT_ENABLED: 'false' }) === false, 'False enabled remote')
    expect(factory.isRemoteContentEnabled({ VITE_REMOTE_CONTENT_ENABLED: 'TRUE' }) === false, 'TRUE enabled remote')
    expect(factory.isRemoteContentEnabled({ VITE_REMOTE_CONTENT_ENABLED: 'true' }) === true, 'true did not enable validation')
  })
  await check('factory', 'Environment status validation is deterministic and safe', () => {
    expect(factory.getSupabaseEnvStatus({}).status === 'disabled', 'Wrong disabled status')
    expect(factory.getSupabaseEnvStatus({ VITE_REMOTE_CONTENT_ENABLED: 'true' }).status === 'env-missing', 'Wrong missing status')
    expect(factory.getSupabaseEnvStatus({
      VITE_REMOTE_CONTENT_ENABLED: 'true',
      VITE_SUPABASE_URL: 'http://example.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: syntheticValues.publishableKey
    }).status === 'env-invalid', 'HTTP URL was accepted')
    expect(factory.getSupabaseEnvStatus(publishableEnv).status === 'ready', 'Publishable env is not ready')
    expect(factory.getSupabaseEnvStatus(anonEnv).status === 'ready', 'Anon env is not ready')
  })
  await check('factory', 'Publishable key has priority over anon compatibility key', () => {
    const status = factory.getSupabaseEnvStatus({
      ...publishableEnv,
      VITE_SUPABASE_ANON_KEY: syntheticValues.anonKey
    })
    expect(status.keySource === 'publishable', 'Publishable key lost priority')
  })
  await check('factory', 'Disabled creation throws a controlled safe error', () => {
    let thrown = null
    try {
      factory.createSupabaseClient({})
    } catch (error) {
      thrown = error
    }
    expect(thrown instanceof factory.SupabaseEnvironmentError, 'Wrong disabled error type')
    expect(thrown.code === 'SUPABASE_REMOTE_DISABLED', 'Wrong disabled error code')
  })
  await check('factory', 'Factory errors do not expose environment values', () => {
    let thrown = null
    try {
      factory.createSupabaseClient({
        VITE_REMOTE_CONTENT_ENABLED: 'true',
        VITE_SUPABASE_URL: 'http://unsafe-value.invalid',
        VITE_SUPABASE_PUBLISHABLE_KEY: syntheticValues.publishableKey
      })
    } catch (error) {
      thrown = error
    }
    expect(thrown instanceof factory.SupabaseEnvironmentError, 'Expected environment error')
    const publicError = JSON.stringify({
      name: thrown.name,
      message: thrown.message,
      code: thrown.code,
      status: thrown.status,
      missing: thrown.missing
    })
    expect(!publicError.includes('unsafe-value'), 'Error exposed URL')
    expect(!publicError.includes(syntheticValues.publishableKey), 'Error exposed key')
  })
  await check('factory', 'Synthetic clients are isolated and make zero fetch calls', async () => {
    const fetchesBeforeClients = fetchCalls
    expect(Boolean(factory.createSupabaseClient(publishableEnv)), 'Direct client was not created')
    const customOne = factory.getSupabaseClient(anonEnv)
    const customTwo = factory.getSupabaseClient(anonEnv)
    expect(customOne !== customTwo, 'Custom env populated a singleton')

    let defaultError = null
    try {
      factory.getSupabaseClient()
    } catch (error) {
      defaultError = error
    }
    expect(defaultError?.code === 'SUPABASE_REMOTE_DISABLED', 'Custom env contaminated default singleton')

    await new Promise((resolve) => setTimeout(resolve, 25))
    expect(fetchCalls === fetchesBeforeClients, 'Client construction attempted fetch')
  })
}

async function verifyRuntime() {
  const sourceFiles = await Promise.all(
    (await walk(absolute('src'))).map(async (filePath) => ({
      path: relative(filePath),
      source: await readFile(filePath, 'utf8')
    }))
  )
  const repositorySource = await source('src/repositories/contentRepository.js')
  const serviceSource = await source('src/services/contentService.js')
  const remoteSource = await source('src/repositories/remoteContentRepository.js')
  const factorySource = await source(factoryPath)

  await check('runtime', 'Content repository selector remains local-only', () => {
    expect(/export\s+\*\s+from\s+['"]\.\/localContentRepository(?:\.js)?['"]/.test(repositorySource), 'Local export missing')
    expect(!/remoteContentRepository|supabase\/client/i.test(repositorySource), 'Selector imports remote code')
  })
  await check('runtime', 'Content service remains sync and repository-agnostic', () => {
    expect(/from\s+['"]\.\.\/repositories\/contentRepository(?:\.js)?['"]/.test(serviceSource), 'Repository selector import missing')
    expect(!/remoteContentRepository|supabase\/client/i.test(serviceSource), 'Service imports remote code')
    expect(!/export\s+async\s+function/.test(serviceSource), 'Content service became async')
    for (const name of contentServiceFunctions) {
      expect(new RegExp(`export\\s+function\\s+${name}\\s*\\(`).test(serviceSource), `Missing contentService export: ${name}`)
    }
  })
  await check('runtime', 'Remote repository imports only its structural contract', () => {
    expect(/from\s+['"]\.\/contentRepositoryContract\.js['"]/.test(remoteSource), 'Contract import missing')
    expect(!/@supabase|supabase\/client|localContentStore|localContentRepository/i.test(remoteSource), 'Forbidden remote import')
  })
  await check('runtime', 'Supabase package import is allowlisted to the factory', () => {
    expectFactoryOnly(sourceFiles, /@supabase\/supabase-js/, 'Supabase package import')
  })
  await check('runtime', 'createClient is allowlisted to the factory', () => {
    expectFactoryOnly(sourceFiles, /\bcreateClient\b/, 'createClient')
  })
  await check('runtime', 'Factory APIs are not imported by active runtime', () => {
    expectFactoryOnly(sourceFiles, /\b(?:getSupabaseClient|createSupabaseClient)\b/, 'Factory API')
  })
  await check('runtime', 'Supabase environment access is allowlisted to the factory', () => {
    expectFactoryOnly(sourceFiles, /\bVITE_SUPABASE_[A-Z_]+\b/, 'Supabase env')
    expectFactoryOnly(sourceFiles, /\bVITE_REMOTE_CONTENT_ENABLED\b/, 'Remote flag')
  })
  await check('runtime', 'Factory source contains no query or realtime calls', () => {
    expect(!/\.(?:from|rpc|channel)\s*\(|\bstorage\s*\./.test(factorySource), 'Factory contains an operation')
  })
}

try {
  await verifyRepository()
  await verifyFactory()
  await verifyRuntime()
} finally {
  if (originalFetch === undefined) delete globalThis.fetch
  else globalThis.fetch = originalFetch
}

const labels = {
  repository: 'Repository contract',
  factory: 'Supabase factory',
  runtime: 'Runtime isolation'
}
let passed = 0
let failed = 0

console.log('Supabase isolation verification')
for (const [section, checks] of Object.entries(results)) {
  console.log(`\n${labels[section]}`)
  for (const result of checks) {
    if (result.passed) {
      passed += 1
      console.log(`  [PASS] ${result.label}`)
    } else {
      failed += 1
      console.error(`  [FAIL] ${result.label}: ${result.error}`)
    }
  }
}

console.log('\nSummary')
console.log(`  Passed: ${passed}`)
console.log(`  Failed: ${failed}`)
console.log(`  Fetch calls: ${fetchCalls}`)

if (failed > 0 || fetchCalls > 0) process.exitCode = 1
else console.log('  Result: isolation contract verified')
