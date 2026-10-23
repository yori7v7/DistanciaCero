import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

// Test-only server: two real builds of this checkout, never the user's dist/profile.
const root = fileURLToPath(new URL('../', import.meta.url))
const output = resolve(root, 'test-results/pwa-update-builds')
const releases = {}
process.env.VITE_REMOTE_CONTENT_ENABLED = 'false'
process.env.VITE_BASE = '/'

for (const release of ['A', 'B']) {
  const dir = resolve(output, release)
  if (!dir.startsWith(output + sep)) throw new Error('Build outside fixture directory')
  const transformed = new Set()
  await build({
    root,
    configFile: resolve(root, 'vite.config.ts'),
    base: '/',
    build: { outDir: dir, emptyOutDir: true },
    plugins: [{
      name: 'pwa-update-fixture',
      enforce: 'pre',
      transform(code, id) {
        const path = id.split('?')[0].replaceAll('\\', '/')
        if (path.endsWith('/src/main.tsx')) {
          transformed.add('entry')
          return `${code}\ndocument.documentElement.dataset.pwaTestRelease = '${release}'\n`
        }
        if (path.endsWith('/src/components/StoryTimeline.tsx')) {
          const title = 'title="Convertí nuestra historia en un diario"'
          if (!code.includes(title)) throw new Error('Timeline fixture needs updating')
          transformed.add('lazy')
          return code.replace(title, `title="Diario de prueba ${release}"`)
        }
      },
    }],
  })
  if (transformed.size !== 2) throw new Error('Both entry and lazy fixture must be built')
  const assets = (await readdir(resolve(dir, 'assets'))).filter(name => name.endsWith('.js'))
  releases[release] = {
    dir,
    entry: assets.find(name => /^index-.*\.js$/.test(name)),
    lazy: assets.find(name => /^StoryTimeline-.*\.js$/.test(name)),
    swHash: createHash('sha256').update(await readFile(resolve(dir, 'sw.js'))).digest('hex'),
  }
}
for (const field of ['entry', 'lazy', 'swHash']) {
  if (!releases.A[field] || releases.A[field] === releases.B[field]) {
    throw new Error(`Releases must have distinct ${field}`)
  }
}
const metadata = Object.fromEntries(Object.entries(releases).map(([name, { dir, ...data }]) => [name, data]))
await writeFile(resolve(output, 'releases.json'), JSON.stringify(metadata, null, 2) + '\n')

let active = 'A'
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' }
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1:4175')
    response.setHeader('Cache-Control', 'no-store')
    if (url.pathname.startsWith('/__pwa_test__/')) {
      const release = url.pathname.match(/^\/__pwa_test__\/release\/([AB])$/)?.[1]
      if (request.method === 'POST' && release) active = release
      else if (request.method !== 'GET' || url.pathname !== '/__pwa_test__/status') {
        response.writeHead(404).end()
        return
      }
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify({ active, releases: metadata }))
      return
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405).end()
      return
    }
    const dir = releases[active].dir
    let path = resolve(dir, '.' + decodeURIComponent(url.pathname))
    if (!path.startsWith(dir + sep) && path !== dir) {
      response.writeHead(403).end()
      return
    }
    // SPA fallback only for navigations, never missing chunks or sw.js.
    if (url.pathname === '/' || !extname(url.pathname)) path = resolve(dir, 'index.html')
    if (!(await stat(path)).isFile()) throw Object.assign(new Error('Missing file'), { code: 'ENOENT' })
    response.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream')
    response.end(request.method === 'HEAD' ? undefined : await readFile(path))
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 500).end()
  }
})
server.on('error', error => { console.error(error); process.exitCode = 1 })
server.listen(4175, '127.0.0.1', () => console.log('PWA release fixture ready at http://127.0.0.1:4175'))
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit()))
