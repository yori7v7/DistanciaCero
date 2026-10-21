import { once } from 'node:events'
import { createServer } from 'node:http'

// Keep this control/navigation journey away from a natural loop boundary,
// including WebKit's 240-second total test budget on Windows.
function silentWave(seconds = 300): Buffer {
  const samples = 8000 * seconds
  const wave = Buffer.alloc(44 + samples * 2)
  wave.write('RIFF', 0); wave.writeUInt32LE(wave.length - 8, 4); wave.write('WAVEfmt ', 8)
  wave.writeUInt32LE(16, 16); wave.writeUInt16LE(1, 20); wave.writeUInt16LE(1, 22)
  wave.writeUInt32LE(8000, 24); wave.writeUInt32LE(16000, 28)
  wave.writeUInt16LE(2, 32); wave.writeUInt16LE(16, 34); wave.write('data', 36)
  wave.writeUInt32LE(samples * 2, 40)
  return wave
}

// WebKit's native media loader needs an actual HTTP response on Windows.
// Keep the same synthetic WAV and exercise native playback without route.fulfill.
export async function startAudioFixture(paths: readonly string[]) {
  const available = new Set(paths)
  const wave = silentWave()
  const server = createServer((request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Cache-Control', 'no-store')
    if (!available.has((request.url || '').split('?')[0])) {
      response.writeHead(404, { 'Content-Length': 0 }).end()
      return
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD', 'Content-Length': 0 }).end()
      return
    }
    response.setHeader('Accept-Ranges', 'bytes')
    response.setHeader('Content-Type', 'audio/wav')
    const range = request.method === 'GET' ? request.headers.range : undefined
    // A single byte range is sufficient for the media loader. Ignore unsupported
    // range units or multi-range requests and return the entire representation.
    const match = range?.match(/^bytes=(\d*)-(\d*)$/)
    if (match) {
      const first = match[1] ? Number(match[1]) : undefined
      const last = match[2] ? Number(match[2]) : undefined
      const start = first ?? Math.max(0, wave.length - (last ?? 0))
      const end = first === undefined || last === undefined ? wave.length - 1 : Math.min(last, wave.length - 1)
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)
        || start >= wave.length || start > end || (first === undefined && !last)) {
        response.writeHead(416, { 'Content-Range': `bytes */${wave.length}`, 'Content-Length': 0 }).end()
        return
      }
      response.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${wave.length}`,
        'Content-Length': end - start + 1,
      }).end(wave.subarray(start, end + 1))
      return
    }
    response.writeHead(200, { 'Content-Length': wave.length })
    response.end(request.method === 'HEAD' ? undefined : wave)
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') {
    server.close()
    throw new Error('The local audio fixture did not receive a TCP port')
  }
  return {
    origin: `http://127.0.0.1:${address.port}`,
    async close() {
      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve())
        server.closeAllConnections()
      })
    },
  }
}
