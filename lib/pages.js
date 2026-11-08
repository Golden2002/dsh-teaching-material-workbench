/**
 * Page model, export and version history for the workbench UI.
 *
 * One timeline segment becomes one page. `pages.json` is the content source;
 * `build/` files are derived. Export writes Markdown/HTML and storyboard/Manim
 * scripts without pretending to render binary Office files inside the plugin.
 */

import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseYaml } from './yaml.js'
import { parseCsvTable } from './csv.js'
import { exportOffice } from './office-export.js'

const PAGES_FILE = 'pages.json'
const HISTORY_DIR = '.history'
const TEXT_SOURCES = [
  'pages.json',
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
]

function readCsvRows(dir, name) {
  const file = join(dir, name)
  if (!existsSync(file)) return []
  return parseCsvTable(readFileSync(file, 'utf8')).rows
}

function readLesson(dir) {
  const file = join(dir, 'lesson.yml')
  if (!existsSync(file)) throw new Error('lesson.yml not found')
  return parseYaml(readFileSync(file, 'utf8')) ?? {}
}

function nowStamp() {
  const time = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').replace(/\..*/, '')
  return `${time}-${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Generate page drafts from the timeline.
 * @param {string} dir - case directory.
 * @returns {{pages: object[], warnings: string[]}} draft.
 */
export function draftPages(dir) {
  const lesson = readLesson(dir)
  const timeline = readCsvRows(dir, 'timeline.csv')
  const warnings = []
  if (timeline.length === 0) warnings.push('timeline.csv 没有数据行，页列表为空')
  const pages = timeline.map((row, index) => {
    const start = Number(row.start)
    const end = Number(row.end)
    const minutes = Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, end - start) : 0
    return {
      id: `p${String(index + 1).padStart(2, '0')}`,
      segment: row.segment || `环节 ${index + 1}`,
      minutes,
      title: row.segment || `环节 ${index + 1}`,
      layout: '要点页',
      slide: { bullets: [row.teacher, row.student].filter(Boolean).slice(0, 3) },
      handout: {
        heading: row.segment || `环节 ${index + 1}`,
        paragraphs: [row.teacher, row.student].filter(Boolean),
        task: row.output || '',
      },
      notes: '',
      sources: [],
    }
  })
  const total = pages.reduce((sum, page) => sum + page.minutes, 0)
  if (lesson.duration_min && Math.abs(total - Number(lesson.duration_min)) > 0.01) warnings.push(`页时长合计 ${total} 分钟，与设定 ${lesson.duration_min} 分钟不一致`)
  return { pages, warnings }
}

/**
 * Read pages.json.
 * @param {string} dir - case directory.
 * @returns {null|{schema:number, revision:number, pages:object[]}} pages or null.
 */
export function loadPages(dir) {
  const file = join(dir, PAGES_FILE)
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf8'))
}

function backupVersion(dir, reason) {
  const stamp = nowStamp()
  const target = join(dir, HISTORY_DIR, `${stamp}-${reason.replace(/[^\w-]/g, '') || 'save'}`)
  mkdirSync(target, { recursive: true })
  const copied = []
  for (const name of TEXT_SOURCES) {
    const source = join(dir, name)
    if (existsSync(source) && statSync(source).isFile()) {
      copyFileSync(source, join(target, name))
      copied.push(name)
    }
  }
  return { id: target.split(/[\\/]/).pop(), dir: target, files: copied, created_at: new Date().toISOString() }
}

/**
 * Save pages.json and refresh derived outline.
 * @param {string} dir - case directory.
 * @param {object} pages - page list.
 * @param {number} [expectedRevision] - optimistic lock.
 * @returns {object} save outcome.
 */
export function savePages(dir, pages, expectedRevision) {
  if (!Array.isArray(pages) || pages.length === 0) throw new Error('pages must be a non-empty array')
  const previous = loadPages(dir)
  if (previous && Number.isFinite(expectedRevision) && Number(expectedRevision) !== previous.revision) {
    const error = new Error('revision conflict: reload the case')
    error.status = 409
    throw error
  }
  const backup = backupVersion(dir, 'pages')
  const revision = (previous?.revision ?? 0) + 1
  const data = { schema: 1, revision, updated_at: new Date().toISOString(), pages }
  mkdirSync(join(dir, 'build'), { recursive: true })
  writeFileSync(join(dir, PAGES_FILE), `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  writeFileSync(join(dir, 'build', 'outline.md'), pagesToOutline(dir, pages), 'utf8')
  return { ok: true, revision, version_id: backup.id }
}

/**
 * Markdown outline from pages.
 * @param {string} dir - case directory.
 * @param {object[]} pages - page list.
 * @returns {string} Markdown.
 */
export function pagesToOutline(dir, pages) {
  const lesson = readLesson(dir)
  const lines = [`# ${lesson.title ?? '未命名课程'} · 课件大纲`, '', `- 时长：${lesson.duration_min ?? '?'} 分钟`, `- 评估：${lesson.assessment?.type ?? '未设置'}（${lesson.assessment?.total_marks ?? 0} 分）`, '']
  for (const [index, page] of pages.entries()) {
    lines.push(`## 第 ${index + 1} 页 · ${page.title || page.segment || '未命名页'}（${page.minutes ?? '?'} 分钟）`, '')
    lines.push(`- 版面：${page.layout ?? '要点页'}`)
    for (const bullet of page.slide?.bullets ?? []) lines.push(`- 课件要点：${bullet}`)
    if (page.handout?.heading) lines.push(`- 讲义小节：${page.handout.heading}`)
    for (const paragraph of page.handout?.paragraphs ?? []) lines.push(`  - ${paragraph}`)
    if (page.notes) lines.push(`- 讲稿：${page.notes}`)
    if (page.sources?.length) lines.push(`- 来源：${page.sources.map((id) => `[${id}]`).join('、')}`)
    lines.push('')
  }
  lines.push('> 本大纲由 pages.json 生成。改内容请改页数据，不直接改本文件。', '')
  return lines.join('\n')
}

/**
 * Export pages to text deliverables and lightweight media scripts.
 * @param {string} dir - case directory.
 * @param {'handout'|'deck'|'storyboard'|'manim'|'all'} target - export target.
 * @returns {object} artifacts with hashes and any degraded notes.
 */
export function exportPages(dir, target = 'all') {
  const pages = loadPages(dir)?.pages ?? draftPages(dir).pages
  const lesson = readLesson(dir)
  const build = join(dir, 'build')
  const media = join(dir, 'animations')
  mkdirSync(build, { recursive: true })
  const artifacts = []
  const degraded = []
  const targets = Array.isArray(target) ? target : [target]
  const want = (name) => targets.includes('all') || targets.includes(name)
  const write = (file, text) => {
    writeFileSync(file, text, 'utf8')
    artifacts.push({ path: file, sha256: createHash('sha256').update(text).digest('hex') })
  }
  if (want('handout')) {
    const lines = [`# ${lesson.title ?? '讲义'}`, '']
    for (const page of pages) {
      lines.push(`## ${page.handout?.heading || page.title}`, '')
      for (const paragraph of page.handout?.paragraphs ?? []) lines.push(paragraph, '')
      if (page.handout?.task) lines.push(`任务：${page.handout.task}`, '')
      if (page.sources?.length) lines.push(`来源：${page.sources.map((id) => `[${id}]`).join('、')}`, '')
    }
    write(join(build, 'handout.md'), lines.join('\n'))
  }
  if (want('deck')) {
    const lines = [`# ${lesson.title ?? '课件'}`, '']
    for (const [index, page] of pages.entries()) {
      lines.push(`## 第 ${index + 1} 页 · ${page.title}`, '')
      for (const bullet of page.slide?.bullets ?? []) lines.push(`- ${bullet}`)
      lines.push(`- 版面：${page.layout}`)
      lines.push('')
    }
    write(join(build, 'deck.md'), lines.join('\n'))
  }
  if (want('storyboard')) {
    const lines = ['# 视频分镜与讲稿', '', '| 时间 | 画面 | 旁白 | 字幕 | 来源 |', '|---|---|---|---|---|']
    let cursor = 0
    for (const page of pages) {
      const start = cursor
      cursor += Number(page.minutes || 0)
      lines.push(`| ${start}–${cursor} 分钟 | ${page.title} | ${(page.notes || page.handout?.paragraphs?.join('；') || '').replaceAll('|', '／')} | ${page.slide?.bullets?.join('；')?.replaceAll('|', '／') ?? ''} | ${page.sources?.join('、') ?? ''} |`)
    }
    write(join(build, 'storyboard.md'), lines.join('\n'))

    const script = [`# ${lesson.title ?? '讲稿'} · 旁白稿`, '']
    for (const [index, page] of pages.entries()) {
      script.push(`## 第 ${index + 1} 段 · ${page.title}`, '')
      const narration = page.notes || (page.handout?.paragraphs ?? []).join('；')
      script.push(narration || '（尚未填写旁白）', '')
    }
    write(join(build, 'script.md'), script.join('\n'))

    const srt = []
    let cue = 0
    let seconds = 0
    const stamp = (value) => {
      const ms = Math.max(0, Math.round(value * 1000))
      const hh = String(Math.floor(ms / 3_600_000)).padStart(2, '0')
      const mm = String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, '0')
      const ss = String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0')
      const mmm = String(ms % 1000).padStart(3, '0')
      return `${hh}:${mm}:${ss},${mmm}`
    }
    for (const page of pages) {
      const duration = Math.max(0, Number(page.minutes || 0)) * 60
      const text = (page.notes || (page.handout?.paragraphs ?? []).join('；') || page.title || '').trim()
      if (!text) {
        seconds += duration
        continue
      }
      cue += 1
      srt.push(String(cue), `${stamp(seconds)} --> ${stamp(seconds + duration)}`, text.replace(/\n+/g, ' '), '')
      seconds += duration
    }
    write(join(build, 'subtitles.srt'), srt.join('\n'))
    degraded.push('storyboard 只有文本分镜与旁白/字幕稿；旁白时长按页分钟粗估，未做 TTS，未渲染视频')
  }
  if (want('manim')) {
    mkdirSync(media, { recursive: true })
    for (const [index, page] of pages.entries()) {
      const className = `Scene${String(index + 1).padStart(2, '0')}`
      const title = JSON.stringify(page.title || `第 ${index + 1} 页`)
      const bullets = (page.slide?.bullets ?? []).map((item) => JSON.stringify(String(item)))
      const code = `from manim import *\n\n\nclass ${className}(Scene):\n    """${(page.title || '').replaceAll('"', "'")}"""\n\n    def construct(self):\n        title = Text(${title}, font_size=40)\n        self.play(Write(title))\n        self.wait(0.5)\n${bullets.length ? bullets.map((item) => `        bullet = Text(${item}, font_size=28)\n        self.play(FadeIn(bullet, shift=UP * 0.3))\n        self.wait(0.3)`).join('\n') : '        pass'}\n        self.wait(1)\n`
      write(join(media, `${className}.py`), code)
    }
    degraded.push('Manim 只生成场景脚本，未执行渲染；本机未检测到 manim/ffmpeg 时无法出视频')
  }
  if (want('docx') || want('pptx')) {
    const office = exportOffice(dir, { lesson, pages }, ['docx', 'pptx'].filter((format) => want(format)))
    artifacts.push(...office.artifacts)
    degraded.push(...office.degraded)
  }
  return { ok: true, artifacts, degraded_reason: degraded }
}

/**
 * List saved versions.
 * @param {string} dir - case directory.
 * @returns {object[]} versions newest first.
 */
export function listHistory(dir) {
  const root = join(dir, HISTORY_DIR)
  if (!existsSync(root)) return []
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const full = join(root, entry.name)
      const files = readdirSync(full).filter((name) => existsSync(join(full, name)))
      return { id: entry.name, created_at: statSync(full).mtime.toISOString(), files }
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

/**
 * Restore one saved version.
 * @param {string} dir - case directory.
 * @param {string} versionId - history directory name.
 * @returns {object} restore outcome.
 */
export function restoreHistory(dir, versionId) {
  const safe = String(versionId).replace(/[^\w.-]/g, '')
  const source = join(dir, HISTORY_DIR, safe)
  if (!existsSync(source)) throw new Error('version not found')
  const current = backupVersion(dir, 'before-restore')
  const restored = []
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (!entry.isFile()) continue
    copyFileSync(join(source, entry.name), join(dir, entry.name))
    restored.push(entry.name)
  }
  return { ok: true, restored, backup_version: current.id }
}
