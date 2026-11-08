/**
 * Optional Office export path.
 *
 * The plugin itself has no runtime dependencies. When the host machine has
 * Python plus python-docx / python-pptx, the export calls these scripts as
 * separate processes (no shell, fixed argument list) and reports their output.
 * When the interpreter or libraries are missing, the caller keeps the
 * Markdown deliverables and records an explicit degraded reason.
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const TIMEOUT_MS = 60_000

function findPython() {
  const candidates = [process.env.PYTHON, 'python', 'py'].filter((item) => item && item.trim())
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ['-c', 'import sys; print(sys.version_info[0])'], { encoding: 'utf8', timeout: 10_000, windowsHide: true })
    if (result.status === 0 && String(result.stdout).trim().startsWith('3')) return candidate
  }
  return null
}

function runScript(python, script, input, output) {
  const result = spawnSync(python, [script, input, output], { encoding: 'utf8', timeout: TIMEOUT_MS, windowsHide: true })
  if (result.error) return { ok: false, reason: result.error.message }
  if (result.status !== 0) return { ok: false, reason: `${result.stderr || result.stdout || 'exit ' + result.status}`.trim().slice(0, 600) }
  if (!existsSync(output)) return { ok: false, reason: 'script returned success but produced no file' }
  const bytes = readFileSync(output)
  return { ok: true, path: output, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }
}

/**
 * Export DOCX and PPTX through the optional Python helpers.
 * @param {string} dir - case directory.
 * @param {{lesson: object, pages: object[]}} data - export data.
 * @param {string[]} formats - subset of ['docx','pptx'].
 * @returns {{artifacts: object[], degraded: string[]}} outcome.
 */
export function exportOffice(dir, data, formats) {
  const artifacts = []
  const degraded = []
  const python = findPython()
  if (!python) {
    degraded.push('未找到 Python 3，DOCX/PPTX 未生成；请用 build/handout.md、build/deck.md 交给 Office 技能或外部模板')
    return { artifacts, degraded }
  }
  const build = join(dir, 'build')
  const input = join(build, '.export-input.json')
  writeFileSync(input, JSON.stringify(data), 'utf8')
  const scripts = {
    docx: fileURLToPath(new URL('./export-docx.py', import.meta.url)),
    pptx: fileURLToPath(new URL('./export-pptx.py', import.meta.url)),
  }
  try {
    for (const format of formats) {
      if (format !== 'docx' && format !== 'pptx') continue
      const output = join(build, format === 'docx' ? 'handout.docx' : 'deck.pptx')
      const outcome = runScript(python, scripts[format], input, output)
      if (outcome.ok) {
        artifacts.push({ path: output, bytes: outcome.bytes, sha256: outcome.sha256 })
      } else {
        degraded.push(`${format.toUpperCase()} 导出失败：${outcome.reason}`)
      }
    }
  } finally {
    try {
      rmSync(input, { force: true })
    } catch {}
  }
  return { artifacts, degraded }
}
