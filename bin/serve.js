#!/usr/bin/env node
import { createServer } from 'http'
import { createReadStream, existsSync } from 'fs'
import { stat } from 'fs/promises'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'
import { request as httpReq } from 'http'
import { request as httpsReq } from 'https'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..', 'dist')

const args = process.argv.slice(2)
const apiIdx = args.indexOf('--api')
const portIdx = args.indexOf('--port')

const API_URL = args[apiIdx + 1] ?? process.env.VALIDRA_API_URL ?? 'http://localhost:8000'
const PORT = Number(args[portIdx + 1] ?? process.env.PORT ?? 3000)

const API = new URL(API_URL)
const isHttps = API.protocol === 'https:'

const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'application/javascript',
  '.css':   'text/css',
  '.json':  'application/json',
  '.png':   'image/png',
  '.svg':   'image/svg+xml',
  '.ico':   'image/x-icon',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
}

const PROXY_PATHS = ['/generateAndRun', '/validate']

function proxy(req, res) {
  const opts = {
    hostname: API.hostname,
    port: API.port || (isHttps ? 443 : 80),
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: API.host },
  }
  const upstream = (isHttps ? httpsReq : httpReq)(opts, (r) => {
    res.writeHead(r.statusCode, r.headers)
    r.pipe(res)
  })
  upstream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ detail: `Cannot reach validra-core at ${API_URL}` }))
    }
  })
  req.pipe(upstream)
}

async function serveStatic(req, res) {
  const urlPath = req.url.split('?')[0]
  let file = join(DIST, urlPath === '/' ? 'index.html' : urlPath)

  try {
    const s = await stat(file)
    if (s.isDirectory()) file = join(file, 'index.html')
  } catch {
    file = join(DIST, 'index.html')
  }

  if (!existsSync(file)) {
    res.writeHead(404)
    res.end('Not found')
    return
  }

  res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream')
  createReadStream(file).pipe(res)
}

createServer((req, res) => {
  if (PROXY_PATHS.some(p => req.url.startsWith(p))) {
    proxy(req, res)
  } else {
    serveStatic(req, res)
  }
}).listen(PORT, () => {
  console.log(`\n  Validra UI  →  http://localhost:${PORT}`)
  console.log(`  Core API    →  ${API_URL}\n`)
})
