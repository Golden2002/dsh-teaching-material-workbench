/**
 * Case wizard: create a complete case from the Web UI.
 * Reuses the same templates and verification seeds as the init tool.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { CSV_HEADERS, DEFAULT_PALETTE, caseReadme, lessonYaml, profileYaml, slugify, teacherPack } from './templates.js'
import { seedVerification } from './gate.js'
import { PEER_REVIEW_TEMPLATE, PILOT_TEMPLATE, TRIAL_DESIGN_TEMPLATE } from './templates.js'
import { stringifyCsv } from './csv.js'

const SOURCE_HEADER = CSV_HEADERS.sources

function normalizeSources(rows) {
  return (Array.isArray(rows) ? rows : [])
    .filter((row) => String(row?.id ?? '').trim() || String(row?.title ?? '').trim())
    .map((row, index) => {
      const output = { id: '', title: '', publisher: '', date: '', type: 'primary', locator: '', access: '', license: '', verified: 'no', role: '', notes: '' }
      for (const key of SOURCE_HEADER) output[key] = String(row?.[key] ?? '').trim()
      if (!output.id) output.id = `S${String(index + 1).padStart(2, '0')}`
      return output
    })
}

function normalizeTimeline(rows) {
  return (Array.isArray(rows) ? rows : [])
    .filter((row) => String(row?.segment ?? '').trim())
    .map((row, index) => {
      const output = { start: '', end: '', segment: '', teacher: '', student: '', output: '' }
      for (const key of CSV_HEADERS.timeline) output[key] = String(row?.[key] ?? '').trim()
      if (!output.start) output.start = String(index * 10)
      if (!output.end) output.end = String((index + 1) * 10)
      return output
    })
}

/**
 * Create a case with profile, lesson, sources, timeline, teacher pack and verification seeds.
 * @param {string} root - absolute case directory.
 * @param {object} input - wizard fields.
 * @returns {{ok:boolean, directory:string, files:string[]}} result.
 */
export function createCase(root, input) {
  if (existsSync(join(root, 'lesson.yml'))) throw new Error('case already exists: lesson.yml found')
  const title = String(input.title ?? '').trim()
  if (!title) throw new Error('title is required')
  const id = String(input.id ?? '').trim() || slugify(title)
  const duration = Number(input.duration_min ?? 45)
  const context = {
    id,
    title,
    subject: String(input.subject ?? '未指定学科'),
    level: String(input.level ?? '未指定学段'),
    audience: String(input.audience ?? '未指定学习者'),
    setting: String(input.setting ?? '现场授课'),
    language: String(input.language ?? '中文为主'),
    duration_min: Number.isFinite(duration) && duration > 0 ? duration : 45,
    delivery: '现场授课',
    assessment_regime: String(input.assessment_regime ?? '无正式考试'),
    assessment_type: 'formative',
    authorities: [],
  }
  const sources = normalizeSources(input.sources)
  const timeline = normalizeTimeline(input.timeline)
  mkdirSync(root, { recursive: true })
  mkdirSync(join(root, 'assets'), { recursive: true })
  mkdirSync(join(root, 'build'), { recursive: true })
  mkdirSync(join(root, 'verification'), { recursive: true })
  const files = {
    'profile.yml': profileYaml(context),
    'lesson.yml': lessonYaml(context),
    'language.md': `# 学生可见文本样张\n\n把学生将看到的讲义正文放在这里，供 E2-language-paeg 检查。\n`,
    'sources.csv': stringifyCsv(SOURCE_HEADER, sources),
    'claims.csv': `${CSV_HEADERS.claims.join(',')}\n`,
    'knowledge.csv': `${CSV_HEADERS.knowledge.join(',')}\n`,
    'alignment.csv': `${CSV_HEADERS.alignment.join(',')}\n`,
    'rubric.csv': `${CSV_HEADERS.rubric.join(',')}\n`,
    'timeline.csv': stringifyCsv(CSV_HEADERS.timeline, timeline),
    'glossary.csv': `${CSV_HEADERS.glossary.join(',')}\n`,
    'misconceptions.csv': `${CSV_HEADERS.misconceptions.join(',')}\n`,
    'figures.json': `${JSON.stringify({ figures: [] }, null, 2)}\n`,
    'palette.json': `${JSON.stringify(DEFAULT_PALETTE, null, 2)}\n`,
    'teacher-pack.md': teacherPack(context),
    'README.md': caseReadme(context),
    'assets/.gitkeep': '',
    'build/.gitkeep': '',
  }
  for (const [name, content] of Object.entries(files)) {
    const target = join(root, name)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, content, 'utf8')
  }
  seedVerification(root, PEER_REVIEW_TEMPLATE, PILOT_TEMPLATE, TRIAL_DESIGN_TEMPLATE)
  return { ok: true, directory: root, files: Object.keys(files) }
}

/**
 * List figures.json entries and image files under assets/.
 * @param {string} dir - case directory.
 * @returns {{figures: object[], assets: string[]}} assets.
 */
export function listAssets(dir) {
  let figures = []
  const figuresFile = join(dir, 'figures.json')
  if (existsSync(figuresFile)) {
    try {
      figures = JSON.parse(readFileSync(figuresFile, 'utf8')).figures ?? []
    } catch {
      figures = []
    }
  }
  const assets = []
  const assetsDir = join(dir, 'assets')
  if (existsSync(assetsDir)) {
    for (const entry of readdirSync(assetsDir, { withFileTypes: true })) {
      if (entry.isFile() && /\.(png|jpe?g|gif|webp|svg)$/i.test(entry.name)) assets.push(`assets/${entry.name}`)
    }
  }
  return { figures, assets }
}
