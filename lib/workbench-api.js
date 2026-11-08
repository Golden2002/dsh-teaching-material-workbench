/**
 * Host HTTP API for the workbench Web UI.
 *
 * Routes are registered under /teaching-workbench by the Host plugin through
 * the webServer service. The browser half only reads and writes case text
 * files inside an explicit case directory; there is no network access and no
 * path outside that directory is touched.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { runGate, writeGateReport, auditSources, analyzeGrounding } from './gate.js'
import { parseYaml } from './yaml.js'
import { applyReplacements, checkDocument, languageInfo, summarize } from './language.js'
import { draftPages, exportPages, listHistory, loadPages, restoreHistory, savePages } from './pages.js'
import { parseCsvTable, stringifyCsv } from './csv.js'
import { CSV_HEADERS } from './templates.js'

export const API_PREFIX = '/teaching-workbench'
const MAX_BODY = 1_500_000

const EDITABLE = [
  'profile.yml',
  'lesson.yml',
  'language.md',
  'sources.csv',
  'claims.csv',
  'knowledge.csv',
  'alignment.csv',
  'rubric.csv',
  'timeline.csv',
  'glossary.csv',
  'misconceptions.csv',
  'figures.json',
  'palette.json',
  'teacher-pack.md',
  'README.md',
  'pages.json',
  'gate-report.md',
  'verification/grounding-report.md',
  'verification/rights-report.md',
  'verification/repro.json',
  'verification/peer-review.md',
  'verification/trial-design.md',
  'build/outline.md',
  'build/handout.md',
  'build/deck.md',
  'build/storyboard.md',
]
const PREVIEW_EXT = /\.(md|txt|json|csv|ya?ml)$/i

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(body)
}

async function readJsonBody(req) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > MAX_BODY) throw new Error('request body too large')
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function requireAbsolute(value) {
  const text = String(value ?? '').trim()
  if (!text || !isAbsolute(text)) throw new Error('directory must be an absolute path')
  return resolve(text)
}

function caseFile(dir, file) {
  const rel = String(file ?? '').replaceAll('\\', '/')
  if (!EDITABLE.includes(rel)) throw new Error(`file is not editable: ${rel}`)
  const root = resolve(dir)
  const full = resolve(root, rel)
  if (full !== root && !full.startsWith(`${root}${sep}`)) throw new Error('path escapes the case directory')
  return full
}

function listCases(root) {
  const cases = []
  const walk = (current, depth) => {
    if (depth > 2 || cases.length >= 200) return
    let entries = []
    try {
      entries = readdirSync(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules') continue
      const full = join(current, entry.name)
      if (existsSync(join(full, 'lesson.yml'))) {
        let title = entry.name
        try {
          const lesson = parseYaml(readFileSync(join(full, 'lesson.yml'), 'utf8'))
          if (lesson && typeof lesson.title === 'string') title = lesson.title
        } catch {}
        cases.push({ name: entry.name, dir: full, title })
      } else {
        walk(full, depth + 1)
      }
    }
  }
  walk(root, 0)
  return cases.sort((a, b) => a.name.localeCompare(b.name))
}

function sourceCounts(rows) {
  const restricted = new Set(['IBO-restricted', 'publisher-copyright'])
  return {
    total: rows.length,
    primary_verified: rows.filter((row) => row.type === 'primary' && row.verified === 'yes').length,
    unverified: rows.filter((row) => row.verified !== 'yes').length,
    restricted: rows.filter((row) => restricted.has(row.license)).length,
  }
}

function readSources(dir) {
  const file = join(dir, 'sources.csv')
  if (!existsSync(file)) return []
  return parseCsvTable(readFileSync(file, 'utf8')).rows
}

function readCase(dir) {
  const root = resolve(dir)
  if (!existsSync(join(root, 'lesson.yml'))) throw new Error('not a case directory: lesson.yml not found')
  const files = {}
  for (const rel of EDITABLE) {
    const full = join(root, rel)
    if (!existsSync(full) || !statSync(full).isFile()) continue
    if (PREVIEW_EXT.test(rel) || rel.endsWith('.csv') || rel.endsWith('.yml')) files[rel] = readFileSync(full, 'utf8')
  }
  const artifacts = []
  const buildDir = join(root, 'build')
  if (existsSync(buildDir)) {
    for (const entry of readdirSync(buildDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue
      const full = join(buildDir, entry.name)
      const stat = statSync(full)
      artifacts.push({ name: entry.name, bytes: stat.size, mtime: stat.mtime.toISOString(), previewable: PREVIEW_EXT.test(entry.name) })
    }
  }
  let title = root.split(/[\\/]/).pop()
  try {
    const lesson = parseYaml(readFileSync(join(root, 'lesson.yml'), 'utf8'))
    if (lesson && typeof lesson.title === 'string') title = lesson.title
  } catch {}
  return { dir: root, title, files, artifacts }
}

function languagePayload(body) {
  if (typeof body.text === 'string' && body.text.trim() !== '') {
    const name = String(body.name ?? 'text.md')
    const violations = checkDocument(name, body.text)
    return { violations, counts: summarize(violations), fixes: applyReplacements(body.text), info: languageInfo() }
  }
  if (body.dir) {
    const root = requireAbsolute(body.dir)
    const rel = String(body.file ?? 'language.md').replaceAll('\\', '/')
    const full = caseFile(root, rel)
    if (!existsSync(full)) throw new Error(`file not found: ${rel}`)
    const text = readFileSync(full, 'utf8')
    const violations = checkDocument(rel, text)
    return { violations, counts: summarize(violations), fixes: applyReplacements(text), info: languageInfo(), file: rel }
  }
  throw new Error('provide text or dir')
}

function summarizeViolations(violations) {
  return summarize(violations)
}

/**
 * Create the HTTP handler mounted at API_PREFIX.
 * @returns {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => Promise<void>} handler.
 */
export function createWorkbenchHandler() {
  return async function handler(req, res) {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost')
      const path = url.pathname.startsWith(API_PREFIX) ? url.pathname.slice(API_PREFIX.length) : url.pathname
      const method = req.method ?? 'GET'
      if (method === 'GET' && path === '/api/health') {
        sendJson(res, 200, { ok: true, language: languageInfo(), version: 1 })
        return
      }
      if (method === 'GET' && path === '/api/cases') {
        const root = requireAbsolute(url.searchParams.get('root'))
        sendJson(res, 200, { ok: true, root, cases: listCases(root) })
        return
      }
      if (method === 'GET' && path === '/api/case') {
        sendJson(res, 200, { ok: true, case: readCase(requireAbsolute(url.searchParams.get('dir'))) })
        return
      }
      if (method === 'GET' && path === '/api/text') {
        const root = requireAbsolute(url.searchParams.get('dir'))
        const full = caseFile(root, url.searchParams.get('file'))
        if (!existsSync(full)) throw new Error('file not found')
        sendJson(res, 200, { ok: true, content: readFileSync(full, 'utf8') })
        return
      }
      if (method === 'POST' && path === '/api/save') {
        const body = await readJsonBody(req)
        const root = requireAbsolute(body.dir)
        const full = caseFile(root, body.file)
        if (typeof body.content !== 'string') throw new Error('content must be a string')
        mkdirSync(dirname(full), { recursive: true })
        writeFileSync(full, body.content, 'utf8')
        sendJson(res, 200, { ok: true, file: relative(root, full).split(sep).join('/') })
        return
      }
      if (method === 'POST' && path === '/api/gate') {
        const body = await readJsonBody(req)
        const root = requireAbsolute(body.dir)
        const outcome = runGate(root)
        const reportPath = writeGateReport(root, outcome)
        sendJson(res, 200, { ok: outcome.summary.fail === 0, summary: outcome.summary, results: outcome.results, report_path: reportPath })
        return
      }
      if (method === 'POST' && path === '/api/language') {
        const body = await readJsonBody(req)
        sendJson(res, 200, { ok: true, ...languagePayload(body) })
        return
      }
      if (method === 'GET' && path === '/api/pages') {
        const root = requireAbsolute(url.searchParams.get('dir'))
        const saved = loadPages(root)
        const draft = draftPages(root)
        sendJson(res, 200, { ok: true, saved, draft })
        return
      }
      if (method === 'POST' && path === '/api/pages') {
        const body = await readJsonBody(req)
        sendJson(res, 200, savePages(requireAbsolute(body.dir), body.pages, body.revision))
        return
      }
      if (method === 'POST' && path === '/api/pages/from-timeline') {
        const body = await readJsonBody(req)
        const root = requireAbsolute(body.dir)
        const draft = draftPages(root)
        if (body.mode === 'apply') {
          const saved = savePages(root, draft.pages, undefined)
          sendJson(res, 200, { ok: true, applied: true, ...draft, ...saved })
        } else {
          sendJson(res, 200, { ok: true, applied: false, ...draft })
        }
        return
      }
      if (method === 'POST' && path === '/api/export') {
        const body = await readJsonBody(req)
        const targets = Array.isArray(body.targets) ? body.targets.map(String) : ['all']
        const result = exportPages(requireAbsolute(body.dir), targets)
        sendJson(res, 200, result)
        return
      }
      if (method === 'GET' && path === '/api/checks') {
        const root = requireAbsolute(url.searchParams.get('dir'))
        const gate = runGate(root)
        const grounding = analyzeGrounding(root)
        const sources = auditSources(root)
        const languageFile = caseFile(root, 'language.md')
        const violations = existsSync(languageFile) ? checkDocument('language.md', readFileSync(languageFile, 'utf8')) : []
        sendJson(res, 200, {
          ok: true,
          gate: { summary: gate.summary, results: gate.results },
          language: { violations, counts: summarize(violations) },
          grounding,
          sources,
        })
        return
      }
      if (method === 'GET' && path === '/api/sources') {
        const root = requireAbsolute(url.searchParams.get('dir'))
        const rows = readSources(root)
        sendJson(res, 200, { ok: true, header: CSV_HEADERS.sources, rows, counts: sourceCounts(rows) })
        return
      }
      if (method === 'POST' && path === '/api/sources') {
        const body = await readJsonBody(req)
        const root = requireAbsolute(body.dir)
        const rows = Array.isArray(body.rows) ? body.rows : []
        for (const [index, row] of rows.entries()) {
          if (!String(row?.id ?? '').trim()) throw new Error(`第 ${index + 1} 行缺少 id`)
          if (!String(row?.title ?? '').trim()) throw new Error(`第 ${index + 1} 行缺少 title`)
        }
        writeFileSync(caseFile(root, 'sources.csv'), stringifyCsv(CSV_HEADERS.sources, rows), 'utf8')
        sendJson(res, 200, { ok: true, rows, counts: sourceCounts(rows) })
        return
      }
      if (method === 'GET' && path === '/api/history/diff') {
        const root = requireAbsolute(url.searchParams.get('dir'))
        const version = String(url.searchParams.get('version') ?? '').replace(/[^\w.-]/g, '')
        const file = String(url.searchParams.get('file') ?? 'pages.json').replaceAll('\\', '/')
        const currentPath = caseFile(root, file)
        const previousPath = join(root, '.history', version, file)
        const current = existsSync(currentPath) ? readFileSync(currentPath, 'utf8') : ''
        const previous = existsSync(previousPath) ? readFileSync(previousPath, 'utf8') : ''
        sendJson(res, 200, { ok: true, file, version, current, previous })
        return
      }
      if (method === 'GET' && path === '/api/history') {
        sendJson(res, 200, { ok: true, versions: listHistory(requireAbsolute(url.searchParams.get('dir'))) })
        return
      }
      if (method === 'POST' && path === '/api/history/restore') {
        const body = await readJsonBody(req)
        sendJson(res, 200, restoreHistory(requireAbsolute(body.dir), body.version))
        return
      }
      sendJson(res, 404, { ok: false, error: `unknown route: ${method} ${path}` })
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error?.message ?? String(error) })
    }
  }
}
