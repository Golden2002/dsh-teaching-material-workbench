/**
 * Deterministic slide outline from the case data.
 *
 * This is not a renderer: it produces a slide-by-slide Markdown outline that
 * an external deck tool can consume. It exists because "generate a deck" and
 * "produce evidence-gated materials" are different jobs; the outline keeps the
 * timeline, rubric and glossary as the single source of truth.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseYaml } from './yaml.js'
import { parseCsvTable } from './csv.js'

function csvRows(dir, name) {
  const file = join(dir, name)
  if (!existsSync(file)) return []
  return parseCsvTable(readFileSync(file, 'utf8')).rows
}

function optionalYaml(dir, name) {
  const file = join(dir, name)
  if (!existsSync(file)) return null
  try {
    return parseYaml(readFileSync(file, 'utf8')) ?? null
  } catch {
    return null
  }
}

/**
 * Build and write build/outline.md.
 * @param {string} dir - absolute case directory.
 * @returns {{ok: boolean, outline_path: string, slides: number, timeline_rows: number}} outcome.
 */
export function buildOutline(dir) {
  const lessonFile = join(dir, 'lesson.yml')
  if (!existsSync(lessonFile)) throw new Error('lesson.yml not found')
  const lesson = parseYaml(readFileSync(lessonFile, 'utf8')) ?? {}
  const timeline = csvRows(dir, 'timeline.csv')
  const rubric = csvRows(dir, 'rubric.csv')
  const glossary = csvRows(dir, 'glossary.csv')
  const sources = csvRows(dir, 'sources.csv')
  const knowledge = csvRows(dir, 'knowledge.csv')
  const profile = optionalYaml(dir, 'profile.yml') ?? {}
  const objectives = Array.isArray(lesson.objectives) ? lesson.objectives : []
  const title = String(lesson.title ?? '未命名课程')
  const lines = [
    `# ${title} · 课件大纲`,
    '',
    `- 时长：${lesson.duration_min ?? '?'} 分钟`,
    `- 学科与层级：${profile.subject ?? '?'} / ${profile.level ?? '?'}`,
    `- 学习者与场景：${profile.audience ?? '?'} / ${profile.setting ?? '?'}`,
    `- 评估：${lesson.assessment?.type ?? '未设置'}（${lesson.assessment?.total_marks ?? 0} 分）`,
    '',
  ]
  if (objectives.length > 0) {
    lines.push('## 学习目标', '')
    for (const objective of objectives) {
      lines.push(`- ${objective.id ?? '?'}：${objective.text ?? ''}`)
    }
    lines.push('')
  }
  timeline.forEach((row, index) => {
    lines.push(`## 第 ${index + 1} 页 · ${row.segment || `环节 ${index + 1}`}（${row.start}–${row.end} 分钟）`, '')
    if (row.teacher) lines.push(`- 教师：${row.teacher}`)
    if (row.student) lines.push(`- 学生：${row.student}`)
    if (row.output) lines.push(`- 产出：${row.output}`)
    lines.push('')
  })
  let slide = timeline.length
  if (rubric.length > 0) {
    slide += 1
    lines.push(`## 第 ${slide} 页 · 评分标准`, '', '| 得分点 | 分值 | 来源 |', '|---|---|---|')
    for (const row of rubric) {
      lines.push(`| ${row.point} | ${row.marks} | ${row.source_id ? `[${row.source_id}]` : '未登记'} |`)
    }
    lines.push('')
  }
  if (glossary.length > 0 && timeline.length > 0) {
    slide += 1
    lines.push(`## 第 ${slide} 页 · 术语表`, '', '| English | 中文 | 首次出现 |', '|---|---|---|')
    for (const row of glossary) {
      lines.push(`| ${row.en} | ${row.zh} | ${row.first_use || ''} |`)
    }
    lines.push('')
  }
  if (knowledge.length > 0) {
    lines.push('## 知识库定位', '', '| 概念 | 来源 | 定位 |', '|---|---|---|')
    for (const row of knowledge) {
      lines.push(`| ${row.concept} | ${row.source_id ? `[${row.source_id}]` : '未登记'} | ${row.locator} |`)
    }
    lines.push('')
  }
  if (sources.length > 0) {
    lines.push('## 来源', '', '| id | 标题 | 定位 | 核验 |', '|---|---|---|---|')
    for (const row of sources) {
      lines.push(`| ${row.id} | ${row.title} | ${row.locator} | ${row.verified} |`)
    }
    lines.push('')
  }
  lines.push('> 本大纲由结构化数据生成。排版、字号、渲染核对在生成课件后另行执行。', '')
  const buildDir = join(dir, 'build')
  mkdirSync(buildDir, { recursive: true })
  const outlinePath = join(buildDir, 'outline.md')
  writeFileSync(outlinePath, lines.join('\n'), 'utf8')
  return { ok: true, outline_path: outlinePath, slides: slide, timeline_rows: timeline.length }
}
