/**
 * Layered gate checks for a teaching-material case directory.
 *
 * Every check returns {gate, layer, basis, status, detail}. `skip` means the
 * check could not run (for example no human review yet); it never counts as a
 * pass. A check that throws is reported as a failure, never silently ignored.
 */

import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, cpSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { parseYaml } from './yaml.js'
import { parseCsvTable } from './csv.js'
import { CSV_HEADERS } from './templates.js'

const ENUMS = {
  type: new Set(['primary', 'secondary']),
  access: new Set(['local', 'public-web', 'login-required', 'purchase']),
  license: new Set(['IBO-restricted', 'publisher-copyright', 'public-domain', 'CC-BY-4.0', 'own-work', 'unknown']),
  verified: new Set(['yes', 'partial', 'no']),
  role: new Set(['syllabus', 'markscheme', 'examiner-report', 'textbook', 'brief', 'standard', 'guidance', 'research', 'exercise', 'slides', 'case', 'lecture', 'other']),
  rubricStatus: new Set(['official', 'textbook', 'self-authored']),
}

const REQUIRED_PROFILE = ['id', 'title', 'subject', 'level', 'audience', 'setting', 'language', 'duration_min', 'assessment_regime', 'thresholds']
const REQUIRED_LESSON = ['id', 'profile', 'title', 'duration_min', 'objectives', 'assessment', 'outputs']
const FORBIDDEN_BINARY = /\.(pdf|docx|doc|pptx|ppt|xlsx|xls|zip|rar|7z)$/i

function readText(file) {
  return readFileSync(file, 'utf8')
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function readCsv(file) {
  return parseCsvTable(readFileSync(file, 'utf8'))
}

function ok(gate, layer, basis, detail) {
  return { gate, layer, basis, status: 'pass', detail }
}

function fail(gate, layer, basis, detail) {
  return { gate, layer, basis, status: 'fail', detail }
}

function skip(gate, layer, basis, detail) {
  return { gate, layer, basis, status: 'skip', detail }
}

function firstIssues(issues, limit = 6) {
  return issues.slice(0, limit).join('；')
}

function loadCase(dir) {
  const paths = {
    profile: join(dir, 'profile.yml'),
    lesson: join(dir, 'lesson.yml'),
    sources: join(dir, 'sources.csv'),
    claims: join(dir, 'claims.csv'),
    knowledge: join(dir, 'knowledge.csv'),
    alignment: join(dir, 'alignment.csv'),
    rubric: join(dir, 'rubric.csv'),
    timeline: join(dir, 'timeline.csv'),
    glossary: join(dir, 'glossary.csv'),
    misconceptions: join(dir, 'misconceptions.csv'),
    figures: join(dir, 'figures.json'),
    palette: join(dir, 'palette.json'),
    teacherPack: join(dir, 'teacher-pack.md'),
  }
  const data = {}
  const errors = []
  for (const [key, file] of Object.entries(paths)) {
    if (!existsSync(file)) {
      if (key === 'claims' || key === 'knowledge') continue
      errors.push(`缺少 ${relative(dir, file)}`)
      continue
    }
    try {
      if (key === 'profile' || key === 'lesson') data[key] = parseYaml(readText(file))
      else if (key === 'figures' || key === 'palette') data[key] = readJson(file)
      else if (key === 'teacherPack') data[key] = readText(file)
      else data[key] = readCsv(file)
    } catch (error) {
      errors.push(`${relative(dir, file)} 解析失败：${error.message}`)
    }
  }
  return { data, errors, paths }
}

function checkSchema(dir) {
  const { data, errors } = loadCase(dir)
  const issues = [...errors]
  const profile = data.profile ?? {}
  const lesson = data.lesson ?? {}
  for (const key of REQUIRED_PROFILE) {
    if (profile[key] === undefined || profile[key] === null || profile[key] === '') issues.push(`profile.yml 缺 ${key}`)
  }
  for (const key of REQUIRED_LESSON) {
    if (lesson[key] === undefined || lesson[key] === null || lesson[key] === '') issues.push(`lesson.yml 缺 ${key}`)
  }
  if (Array.isArray(lesson.objectives) && lesson.objectives.length === 0) issues.push('lesson.yml 的 objectives 为空')
  if (!lesson.assessment || typeof lesson.assessment !== 'object') issues.push('lesson.yml 缺 assessment 对象')
  if (lesson.assessment && typeof lesson.assessment.total_marks !== 'number') issues.push('assessment.total_marks 不是数字')
  if (!profile.thresholds || typeof profile.thresholds !== 'object') issues.push('profile.yml 缺 thresholds 对象')
  for (const [name, header] of Object.entries(CSV_HEADERS)) {
    const table = data[name === 'sources' ? 'sources' : name]
    if (!table) continue
    const actual = table.header.join(',')
    const expected = header.join(',')
    if (actual !== expected) issues.push(`${name}.csv 表头应为 ${expected}，实际 ${actual}`)
  }
  return issues.length === 0
    ? ok('E1-schema', 'E1', '工作台数据契约：字段与表头完整', '全部数据文件可解析，必填字段齐全')
    : fail('E1-schema', 'E1', '工作台数据契约：字段与表头完整', firstIssues(issues))
}

function checkTimeline(dir) {
  const { data, errors } = loadCase(dir)
  if (errors.length > 0) return skip('E1-timeline', 'E1', '工作台数据契约：时间轴', `数据未就绪：${errors[0]}`)
  const rows = data.timeline?.rows ?? []
  if (rows.length === 0) return fail('E1-timeline', 'E1', '工作台数据契约：时间轴', 'timeline.csv 无数据行')
  const duration = Number(data.lesson?.duration_min)
  const issues = []
  let previousEnd = -Infinity
  let total = 0
  rows.forEach((row, index) => {
    const start = Number(row.start)
    const end = Number(row.end)
    if (!Number.isFinite(start) || !Number.isFinite(end)) issues.push(`第 ${index + 1} 行起止不是数字`)
    else {
      if (end <= start) issues.push(`第 ${index + 1} 行 end ≤ start`)
      if (start < previousEnd) issues.push(`第 ${index + 1} 行与上一行重叠`)
      previousEnd = end
      total += end - start
    }
  })
  if (Number.isFinite(duration) && Math.abs(total - duration) > 0.01) issues.push(`时间轴合计 ${total} 分钟 ≠ 时长 ${duration}`)
  return issues.length === 0
    ? ok('E1-timeline', 'E1', '工作台数据契约：时间轴不重叠且合计等于时长', `共 ${rows.length} 段，合计 ${total} 分钟`)
    : fail('E1-timeline', 'E1', '工作台数据契约：时间轴不重叠且合计等于时长', firstIssues(issues))
}

function checkAlignment(dir) {
  const { data, errors } = loadCase(dir)
  if (errors.length > 0) return skip('E1-alignment', 'E1', '工作台数据契约：目标—活动—评估对齐', `数据未就绪：${errors[0]}`)
  const rows = data.alignment?.rows ?? []
  const objectives = (data.lesson?.objectives ?? []).map((entry) => String(entry.id))
  const issues = []
  if (rows.length === 0) issues.push('alignment.csv 无数据行')
  if (objectives.length === 0) issues.push('lesson.yml 无 objectives')
  const covered = new Set()
  rows.forEach((row, index) => {
    for (const [key, value] of Object.entries(row)) {
      if (String(value ?? '').trim() === '') issues.push(`第 ${index + 1} 行 ${key} 为空`)
    }
    if (row.objective) {
      if (!objectives.includes(row.objective)) issues.push(`第 ${index + 1} 行目标 ${row.objective} 不存在`)
      covered.add(row.objective)
    }
  })
  for (const objective of objectives) {
    if (!covered.has(objective)) issues.push(`目标 ${objective} 没有对应活动`)
  }
  return issues.length === 0
    ? ok('E1-alignment', 'E1', '工作台数据契约：对齐矩阵无空格、目标全覆盖', `${rows.length} 行；${objectives.length} 个目标全部有对应活动`)
    : fail('E1-alignment', 'E1', '工作台数据契约：对齐矩阵无空格、目标全覆盖', firstIssues(issues))
}

function checkRubricSum(dir) {
  const { data, errors } = loadCase(dir)
  if (errors.length > 0) return skip('E1-rubric-sum', 'E1', '工作台数据契约：得分点合计', `数据未就绪：${errors[0]}`)
  const rows = data.rubric?.rows ?? []
  const total = Number(data.lesson?.assessment?.total_marks)
  if (rows.length === 0) return fail('E1-rubric-sum', 'E1', '工作台数据契约：得分点合计', 'rubric.csv 无数据行')
  let sum = 0
  const issues = []
  rows.forEach((row, index) => {
    const marks = Number(row.marks)
    if (!Number.isFinite(marks) || marks < 0) issues.push(`第 ${index + 1} 行 marks 非法`)
    else sum += marks
    if (!ENUMS.rubricStatus.has(row.status)) issues.push(`第 ${index + 1} 行 status 非法（official/textbook/self-authored）`)
  })
  if (!Number.isFinite(total) || total <= 0) issues.push('assessment.total_marks 未设置')
  else if (Math.abs(sum - total) > 0.01) issues.push(`得分点合计 ${sum} ≠ 总分 ${total}`)
  return issues.length === 0
    ? ok('E1-rubric-sum', 'E1', '工作台数据契约：得分点合计等于总分', `${rows.length} 条合计 ${sum} 分`)
    : fail('E1-rubric-sum', 'E1', '工作台数据契约：得分点合计等于总分', firstIssues(issues))
}

function checkConsistency(dir) {
  const { data, errors } = loadCase(dir)
  if (errors.length > 0) return skip('E1-consistency', 'E1', '工作台数据契约：跨文件引用一致', `数据未就绪：${errors[0]}`)
  const issues = []
  const sourceIds = new Set((data.sources?.rows ?? []).map((row) => row.id))
  for (const row of data.rubric?.rows ?? []) {
    if (row.source_id && !sourceIds.has(row.source_id)) issues.push(`rubric 引用不存在的来源 ${row.source_id}`)
  }
  for (const row of data.misconceptions?.rows ?? []) {
    if (row.source_id && !sourceIds.has(row.source_id)) issues.push(`misconceptions 引用不存在的来源 ${row.source_id}`)
  }
  const pack = String(data.teacherPack ?? '').toLowerCase()
  for (const row of data.glossary?.rows ?? []) {
    if (row.en && !pack.includes(String(row.en).toLowerCase())) issues.push(`术语 ${row.en} 未出现在 teacher-pack.md`)
  }
  for (const figure of data.figures?.figures ?? []) {
    const file = join(dir, 'assets', figure.file)
    if (!existsSync(file)) issues.push(`图 ${figure.file} 不存在于 assets/`)
    if (!Array.isArray(figure.used_in) || figure.used_in.length === 0) issues.push(`图 ${figure.file} 缺 used_in`)
  }
  return issues.length === 0
    ? ok('E1-consistency', 'E1', '工作台数据契约：来源、术语、图与产物引用一致', '跨文件引用全部可解析')
    : fail('E1-consistency', 'E1', '工作台数据契约：来源、术语、图与产物引用一致', firstIssues(issues))
}

function checkSources(dir) {
  const { data, errors } = loadCase(dir)
  if (errors.length > 0) return skip('E2-sources', 'E2', '一手材料判定：发布方原件 + 定位', `数据未就绪：${errors[0]}`)
  const rows = data.sources?.rows ?? []
  const issues = []
  if (rows.length === 0) issues.push('sources.csv 无数据行')
  let primaryVerified = 0
  for (const [index, row] of rows.entries()) {
    const label = row.id || `第 ${index + 1} 行`
    for (const key of ['id', 'title', 'publisher', 'locator', 'access', 'license', 'verified', 'role']) {
      if (!String(row[key] ?? '').trim()) issues.push(`${label} 缺 ${key}`)
    }
    if (!ENUMS.type.has(row.type)) issues.push(`${label} type 非法`)
    if (!ENUMS.access.has(row.access)) issues.push(`${label} access 非法`)
    if (!ENUMS.license.has(row.license)) issues.push(`${label} license 非法`)
    if (!ENUMS.verified.has(row.verified)) issues.push(`${label} verified 非法`)
    if (!ENUMS.role.has(row.role)) issues.push(`${label} role 非法`)
    if (row.type === 'primary' && row.verified === 'yes') primaryVerified += 1
  }
  const authorities = data.profile?.authorities
  if (Array.isArray(authorities)) {
    for (const authority of authorities) {
      if (!authority || !authority.role || !authority.source_id) issues.push('profile.authorities 条目缺 role 或 source_id')
      else if (!rows.some((row) => row.id === authority.source_id)) issues.push(`authorities 引用不存在的来源 ${authority.source_id}`)
    }
  }
  if (primaryVerified < 2) issues.push(`已核验的一手材料只有 ${primaryVerified} 条（至少 2 条）`)
  return issues.length === 0
    ? ok('E2-sources', 'E2', '一手材料判定：发布方原件、定位、核验状态', `${rows.length} 条来源，已核验一手 ${primaryVerified} 条`)
    : fail('E2-sources', 'E2', '一手材料判定：发布方原件、定位、核验状态', firstIssues(issues))
}

function checkRubricSource(dir) {
  const { data, errors } = loadCase(dir)
  if (errors.length > 0) return skip('E2-rubric-source', 'E2', '官方评分标准逐点对照', `数据未就绪：${errors[0]}`)
  const rows = data.rubric?.rows ?? []
  const official = rows.filter((row) => row.status === 'official')
  if (official.length === 0) {
    return skip(
      'E2-rubric-source',
      'E2',
      '官方评分标准逐点对照；未取得时只能记“未验证”',
      '没有 official 行：官方 mark scheme 未取得或未录入，评分标准只能视为教材/自拟，未完成官方对照',
    )
  }
  const sources = data.sources?.rows ?? []
  const issues = []
  for (const row of official) {
    const source = sources.find((entry) => entry.id === row.source_id)
    if (!source) issues.push(`official 行引用不存在的来源 ${row.source_id}`)
    else if (source.type !== 'primary' || source.role !== 'markscheme') issues.push(`official 行 ${row.source_id} 不是一手 markscheme`)
  }
  return issues.length === 0
    ? ok('E2-rubric-source', 'E2', '官方评分标准逐点对照', `${official.length} 条 official 行均有官方 markscheme 来源`)
    : fail('E2-rubric-source', 'E2', '官方评分标准逐点对照', firstIssues(issues))
}

function hexToRgb(hex) {
  const text = String(hex).replace('#', '').trim()
  if (!/^[0-9a-fA-F]{6}$/.test(text)) return null
  return [0, 2, 4].map((offset) => parseInt(text.slice(offset, offset + 2), 16))
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((value) => {
    const channel = value / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * WCAG contrast ratio between two hex colours.
 * @param {string} foreground - #rrggbb.
 * @param {string} background - #rrggbb.
 * @returns {number} ratio, or NaN for invalid input.
 */
export function contrastRatio(foreground, background) {
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)
  if (!fg || !bg) return NaN
  const a = luminance(fg)
  const b = luminance(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

function checkAccessibility(dir) {
  const { data, errors } = loadCase(dir)
  if (errors.length > 0) return skip('E2-accessibility', 'E2', 'WCAG 2.2 SC 1.1.1 / 1.4.3', `数据未就绪：${errors[0]}`)
  const issues = []
  const pairs = data.palette?.pairs ?? []
  if (pairs.length === 0) issues.push('palette.json 无配色对')
  for (const [index, pair] of pairs.entries()) {
    const ratio = contrastRatio(pair.fg, pair.bg)
    if (!Number.isFinite(ratio)) issues.push(`第 ${index + 1} 组配色不是 #rrggbb`)
    else if (ratio < Number(pair.min_ratio ?? 4.5)) issues.push(`第 ${index + 1} 组 ${pair.fg}/${pair.bg} 对比度 ${ratio.toFixed(2)} < ${pair.min_ratio ?? 4.5}`)
  }
  for (const figure of data.figures?.figures ?? []) {
    if (!String(figure.alt ?? '').trim()) issues.push(`图 ${figure.file} 缺 alt`)
  }
  const thresholds = data.lesson?.thresholds ?? data.profile?.thresholds ?? {}
  for (const key of ['body_min_pt', 'body_target_pt', 'docx_min_pt', 'page_max_items']) {
    if (typeof thresholds[key] !== 'number') issues.push(`thresholds.${key} 不是数字`)
  }
  return issues.length === 0
    ? ok('E2-accessibility', 'E2', 'WCAG 2.2 SC 1.1.1（替代文本）与 SC 1.4.3（对比度）', `${pairs.length} 组配色达标；图有替代文本；阈值齐全`)
    : fail('E2-accessibility', 'E2', 'WCAG 2.2 SC 1.1.1（替代文本）与 SC 1.4.3（对比度）', firstIssues(issues))
}

const LANGUAGE_RULES = [
  ['中英之间缺空格（中→英）', /[\u4e00-\u9fff][A-Za-z0-9]/g],
  ['中英之间缺空格（英→中）', /[A-Za-z0-9][\u4e00-\u9fff]/g],
  ['中文后接半角标点', /[\u4e00-\u9fff][,;:]/g],
  ['半角标点后接中文', /[,;:][\u4e00-\u9fff]/g],
  ['破折号前后有空格', / ——|—— /g],
  ['使用「」引号', /[「」]/g],
  ['AI 腔套话', /进行|作出|之一|人们|赋能|至关重要|深入探讨/g],
]

/**
 * Run the workbench language rules over one text.
 * @param {string} text - text to check.
 * @returns {{rule: string, snippets: string[]}[]} violations with context.
 */
export function auditLanguage(text) {
  const clean = String(text)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/https?:\/\/\S+/g, '')
  const found = []
  for (const [rule, pattern] of LANGUAGE_RULES) {
    const snippets = []
    for (const match of clean.matchAll(pattern)) {
      const start = Math.max(0, match.index - 10)
      const end = Math.min(clean.length, match.index + match[0].length + 10)
      snippets.push(clean.slice(start, end).replace(/\n/g, ' '))
      if (snippets.length >= 5) break
    }
    if (snippets.length > 0) found.push({ rule, snippets })
  }
  return found
}

function checkLanguage(dir) {
  const { data, errors } = loadCase(dir)
  if (errors.length > 0) return skip('E2-language', 'E2', 'GB/T 15834—2011 与项目语言规范', `数据未就绪：${errors[0]}`)
  const parts = [String(data.teacherPack ?? ''), JSON.stringify(data.lesson ?? {})]
  for (const row of data.rubric?.rows ?? []) parts.push(`${row.point} ${row.evidence} ${row.alternatives}`)
  for (const row of data.glossary?.rows ?? []) parts.push(`${row.zh} ${row.en}`)
  const violations = auditLanguage(parts.join('\n'))
  return violations.length === 0
    ? ok('E2-language', 'E2', 'GB/T 15834—2011 与项目语言规范', '中英间距、全角标点、破折号与套话检查 0 违例')
    : fail('E2-language', 'E2', 'GB/T 15834—2011 与项目语言规范', firstIssues(violations.map((entry) => `${entry.rule}（如：${entry.snippets[0]}）`)))
}

function scanForbiddenFiles(dir) {
  const found = []
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name)
      const rel = relative(dir, full)
      if (entry.isDirectory()) {
        if (rel === 'build' || rel === 'node_modules' || rel.startsWith(`build${sep}`)) continue
        walk(full)
      } else if (FORBIDDEN_BINARY.test(entry.name)) {
        found.push(rel)
      }
    }
  }
  walk(dir)
  return found
}

function checkRights(dir) {
  const { data, errors } = loadCase(dir)
  if (errors.length > 0) return skip('E2-rights', 'E2', '各来源许可条款与版权声明', `数据未就绪：${errors[0]}`)
  const issues = []
  const rows = data.sources?.rows ?? []
  if (rows.length === 0) issues.push('sources.csv 无数据行')
  for (const row of rows) {
    if (row.license === 'unknown') issues.push(`${row.id} 的许可未确认`)
    if (row.access === 'login-required' && row.verified === 'yes') issues.push(`${row.id} 标为需登录却已核验，请核对`)
  }
  const forbidden = scanForbiddenFiles(dir)
  if (forbidden.length > 0) issues.push(`案例目录内有原始材料文件（不得入库）：${forbidden.slice(0, 5).join('、')}`)
  return issues.length === 0
    ? ok('E2-rights', 'E2', '各来源许可条款与版权声明', `${rows.length} 条来源许可已登记；案例目录无原始材料文件`)
    : fail('E2-rights', 'E2', '各来源许可条款与版权声明', firstIssues(issues))
}

function checkKnowledge(dir) {
  const { data, errors } = loadCase(dir)
  if (errors.length > 0) return skip('E2-knowledge', 'E2', '知识库清单：概念 → 来源 + 定位', `数据未就绪：${errors[0]}`)
  const rows = data.knowledge?.rows ?? []
  if (rows.length === 0) return skip('E2-knowledge', 'E2', '知识库清单：概念 → 来源 + 定位', '未提供 knowledge.csv 数据行（未执行）')
  const sourceIds = new Set((data.sources?.rows ?? []).map((row) => row.id))
  const issues = []
  for (const [index, row] of rows.entries()) {
    const label = row.concept || `第 ${index + 1} 行`
    for (const key of ['concept', 'source_id', 'locator']) {
      if (!String(row[key] ?? '').trim()) issues.push(`${label} 缺 ${key}`)
    }
    if (row.source_id && !sourceIds.has(row.source_id)) issues.push(`${label} 引用不存在的来源 ${row.source_id}`)
    if (row.locator && (String(row.locator).trim().length < 2 || COARSE_LOCATOR.test(String(row.locator).trim()))) {
      issues.push(`${label} 的 locator 过粗（${row.locator}）`)
    }
  }
  return issues.length === 0
    ? ok('E2-knowledge', 'E2', '知识库清单：概念 → 来源 + 定位', `${rows.length} 个概念都有来源与定位`)
    : fail('E2-knowledge', 'E2', '知识库清单：概念 → 来源 + 定位', firstIssues(issues))
}

const GROUNDING_STATUS = new Set(['supported', 'partial', 'unsupported'])

const COARSE_LOCATOR = /^(?:p\.?|pp\.?|页|全书|网络|见教材|待补|-|—)$/iu

/**
 * Claim-level grounding audit: every substantive claim must name a source and
 * a locator, and the teacher pack must carry at least one [Sxx] marker.
 * This is the knowledge-base contract borrowed from retrieval-grounded
 * teaching assistants, exposed as a check instead of a chat answer.
 * @param {string} dir - case directory.
 * @returns {object} grounding analysis.
 */
export function analyzeGrounding(dir) {
  const { data, errors } = loadCase(dir)
  const rows = data.claims?.rows ?? []
  const sourceIds = new Set((data.sources?.rows ?? []).map((row) => row.id))
  const issues = [...errors]
  let supported = 0
  let partial = 0
  let unsupported = 0
  for (const [index, row] of rows.entries()) {
    const label = row.id || `第 ${index + 1} 行`
    for (const key of ['id', 'claim', 'source_id', 'locator', 'status']) {
      if (!String(row[key] ?? '').trim()) issues.push(`${label} 缺 ${key}`)
    }
    if (!GROUNDING_STATUS.has(row.status)) issues.push(`${label} status 非法（supported/partial/unsupported）`)
    if (row.source_id && !sourceIds.has(row.source_id)) issues.push(`${label} 引用不存在的来源 ${row.source_id}`)
    if (row.locator && (String(row.locator).trim().length < 2 || COARSE_LOCATOR.test(String(row.locator).trim()))) {
      issues.push(`${label} 的 locator 过粗（${row.locator}），要能定位到页、节、条款或题号`)
    }
    if (row.status === 'supported') supported += 1
    else if (row.status === 'partial') partial += 1
    else if (row.status === 'unsupported') unsupported += 1
  }
  const pack = String(data.teacherPack ?? '')
  const markers = pack.match(/\[S\d+\]/g) ?? []
  const substantive = pack
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 30 && !line.startsWith('#') && !line.startsWith('|') && !line.startsWith('```'))
  const coverage = rows.length === 0 ? 0 : supported / rows.length
  return {
    rows: rows.length,
    supported,
    partial,
    unsupported,
    coverage,
    cited_markers: markers.length,
    substantive_lines: substantive.length,
    issues,
  }
}

function checkGrounding(dir) {
  const analysis = analyzeGrounding(dir)
  if (analysis.rows === 0) {
    return skip('E2-grounding', 'E2', '知识库接地：claim → 来源 + 定位', '未提供 claims.csv 数据行（未执行）')
  }
  const problems = [...analysis.issues]
  if (analysis.unsupported > 0) problems.push(`${analysis.unsupported} 条 unsupported 结论必须改材料`)
  if (analysis.cited_markers === 0) problems.push('teacher-pack.md 没有任何 [Sxx] 来源标记')
  return problems.length === 0
    ? ok(
        'E2-grounding',
        'E2',
        '知识库接地：claim → 来源 + 定位（对齐检索增强式 AI 助教做法）',
        `${analysis.rows} 条结论：supported ${analysis.supported}，partial ${analysis.partial}；teacher-pack 引用标记 ${analysis.cited_markers} 处`,
      )
    : fail('E2-grounding', 'E2', '知识库接地：claim → 来源 + 定位', firstIssues(problems))
}

/**
 * Write the grounding report for one case.
 * @param {string} dir - case directory.
 * @param {ReturnType<typeof analyzeGrounding>} analysis - analysis result.
 * @returns {string} report path.
 */
export function writeGroundingReport(dir, analysis) {
  mkdirSync(join(dir, 'verification'), { recursive: true })
  const file = join(dir, 'verification', 'grounding-report.md')
  const lines = [
    '# 知识库接地报告',
    '',
    `生成时间：${timestamp()}`,
    '',
    '| 指标 | 值 |',
    '|---|---|',
    `| 结论条数 | ${analysis.rows} |`,
    `| supported | ${analysis.supported} |`,
    `| partial | ${analysis.partial} |`,
    `| unsupported | ${analysis.unsupported} |`,
    `| 覆盖率 | ${(analysis.coverage * 100).toFixed(1)}% |`,
    `| teacher-pack 引用标记 | ${analysis.cited_markers} |`,
    `| 实质段落 | ${analysis.substantive_lines} |`,
    '',
  ]
  if (analysis.issues.length > 0) {
    lines.push('## 问题', '')
    for (const issue of analysis.issues) lines.push(`- ${issue}`)
    lines.push('')
  } else {
    lines.push('## 结论', '', '每条结论都能指到来源与定位；没有 unsupported 结论。', '')
  }
  writeFileSync(file, lines.join('\n'), 'utf8')
  return file
}

function buildArtifacts(dir) {
  const buildDir = join(dir, 'build')
  if (!existsSync(buildDir)) return []
  return readdirSync(buildDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(pptx|docx|pdf|md)$/i.test(entry.name))
    .map((entry) => entry.name)
}

function checkBuild(dir) {
  const artifacts = buildArtifacts(dir)
  if (artifacts.length === 0) return skip('E1-build', 'E1', '工作台数据契约：产物存在', 'build/ 下尚无 pptx/docx/pdf/md 产物')
  return ok('E1-build', 'E1', '工作台数据契约：产物存在', `产物：${artifacts.join('、')}`)
}

function checkHuman(dir) {
  const file = join(dir, 'verification', 'peer-review.md')
  if (!existsSync(file)) return skip('E3-human', 'E3', '独立同行评审记录', '未执行：没有 verification/peer-review.md')
  const text = readText(file)
  const findings = (text.match(/^\s*(?:\d+\.|-)\s+\S/gm) ?? []).length
  const hasReviewer = /reviewer|评审人|姓名/i.test(text)
  const hasDate = /date|日期|\d{4}-\d{2}-\d{2}/i.test(text)
  if (!hasReviewer || !hasDate) return fail('E3-human', 'E3', '独立同行评审记录', '记录缺 reviewer 或 date 字段')
  if (findings < 3) return fail('E3-human', 'E3', '独立同行评审记录', `意见条目只有 ${findings} 条（至少 3 条）`)
  return ok('E3-human', 'E3', '独立同行评审记录', `记录含评审人与日期，${findings} 条意见`)
}

function checkPilot(dir) {
  const file = join(dir, 'verification', 'pilot.csv')
  const designFile = join(dir, 'verification', 'trial-design.md')
  const hasDesign = existsSync(designFile) && ['研究问题', '盲法', '样本量', '主要指标'].filter((marker) => readText(designFile).includes(marker)).length >= 3
  if (!existsSync(file)) {
    return hasDesign
      ? skip('E3-pilot', 'E3', '真实学习者数据（前后测或题目统计）', '有试点设计但没有 pilot.csv 数据（未执行）')
      : skip('E3-pilot', 'E3', '真实学习者数据（前后测或题目统计）', '未执行：没有 verification/pilot.csv')
  }
  const table = readCsv(file)
  const required = ['item', 'metric', 'value', 'n']
  const missing = required.filter((name) => !table.header.includes(name))
  if (missing.length > 0) return fail('E3-pilot', 'E3', '真实学习者数据（前后测或题目统计）', `pilot.csv 缺列：${missing.join('、')}`)
  if (table.rows.length === 0) return fail('E3-pilot', 'E3', '真实学习者数据（前后测或题目统计）', 'pilot.csv 没有数据行')
  const filled = table.rows.filter((row) => String(row.value ?? '').trim() !== '' && String(row.n ?? '').trim() !== '')
  if (filled.length === 0) return fail('E3-pilot', 'E3', '真实学习者数据（前后测或题目统计）', 'pilot.csv 有行但 value/n 为空，仍是模板')
  if (!hasDesign) return fail('E3-pilot', 'E3', '真实学习者数据（前后测或题目统计）', '有 pilot.csv 数据但没有 verification/trial-design.md（缺研究设计）')
  return ok('E3-pilot', 'E3', '真实学习者数据（前后测或题目统计）', `pilot.csv 有 ${filled.length} 行已填数据，且有试点设计`)
}

const CHECKS = [
  checkSchema,
  checkTimeline,
  checkAlignment,
  checkRubricSum,
  checkConsistency,
  checkSources,
  checkKnowledge,
  checkRubricSource,
  checkGrounding,
  checkAccessibility,
  checkLanguage,
  checkRights,
  checkBuild,
  checkHuman,
  checkPilot,
]

/**
 * Run every gate check on a case directory.
 * @param {string} dir - absolute case directory.
 * @returns {{results: object[], summary: {pass: number, fail: number, skip: number}}} gate outcome.
 */
export function runGate(dir) {
  const results = []
  for (const check of CHECKS) {
    try {
      results.push(check(dir))
    } catch (error) {
      results.push(fail('??', 'E1', '检查器异常按失败处理', `检查自身异常：${error.message}`))
    }
  }
  const summary = { pass: 0, fail: 0, skip: 0 }
  for (const result of results) summary[result.status] += 1
  return { results, summary }
}

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
}

/**
 * Write the gate report next to the case.
 * @param {string} dir - case directory.
 * @param {{results: object[], summary: object}} outcome - gate outcome.
 * @returns {string} report path.
 */
export function writeGateReport(dir, outcome) {
  mkdirSync(dir, { recursive: true })
  const file = join(dir, 'gate-report.md')
  const lines = [
    '# 门禁报告',
    '',
    `生成时间：${timestamp()}`,
    '',
    '> `未执行`（skip）不等于 `通过`。未完成项必须在交付说明中单列。',
    '',
    '| 门禁 | 层级 | 依据 | 结果 | 说明 |',
    '|---|---|---|---|---|',
  ]
  for (const result of outcome.results) {
    lines.push(`| ${result.gate} | ${result.layer} | ${result.basis} | ${result.status.toUpperCase()} | ${result.detail} |`)
  }
  lines.push('', `合计：通过 ${outcome.summary.pass}，不通过 ${outcome.summary.fail}，未执行 ${outcome.summary.skip}`, '')
  const skipped = outcome.results.filter((result) => result.status === 'skip')
  if (skipped.length > 0) {
    lines.push('## 未执行', '')
    for (const result of skipped) lines.push(`- ${result.gate}：${result.detail}`)
    lines.push('')
  }
  writeFileSync(file, lines.join('\n'), 'utf8')
  return file
}

/**
 * Audit sources and rights; write a rights report.
 * @param {string} dir - case directory.
 * @returns {object} audit result and report path.
 */
export function auditSources(dir) {
  const { data, errors } = loadCase(dir)
  const rows = data.sources?.rows ?? []
  const primaryVerified = rows.filter((row) => row.type === 'primary' && row.verified === 'yes').length
  const secondary = rows.filter((row) => row.type === 'secondary').length
  const restricted = rows.filter((row) => row.license === 'IBO-restricted' || row.license === 'publisher-copyright')
  const missing = []
  for (const row of rows) {
    for (const key of ['id', 'title', 'publisher', 'locator', 'access', 'license', 'verified', 'type', 'role']) {
      if (!String(row[key] ?? '').trim()) missing.push(`${row.id || '?'} 缺 ${key}`)
    }
  }
  const forbidden = scanForbiddenFiles(dir)
  const issues = [...errors, ...missing]
  if (primaryVerified < 2) issues.push(`已核验一手材料 ${primaryVerified} 条，少于 2 条`)
  if (forbidden.length > 0) issues.push(`案例目录含原始材料文件：${forbidden.join('、')}`)
  mkdirSync(join(dir, 'verification'), { recursive: true })
  const file = join(dir, 'verification', 'rights-report.md')
  const lines = [
    '# 来源与版权审计',
    '',
    `生成时间：${timestamp()}`,
    '',
    '| 来源 | 类型 | 核验 | 许可 | 定位 |',
    '|---|---|---|---|---|',
  ]
  for (const row of rows) {
    lines.push(`| ${row.id} | ${row.type} | ${row.verified} | ${row.license} | ${row.locator} |`)
  }
  lines.push('', `统计：来源 ${rows.length} 条；已核验一手 ${primaryVerified} 条；二手 ${secondary} 条；受限 ${restricted.length} 条。`, '')
  if (issues.length > 0) {
    lines.push('## 问题', '')
    for (const issue of issues) lines.push(`- ${issue}`)
    lines.push('')
  } else {
    lines.push('## 结论', '', '字段完整；受限材料未放进案例目录。', '')
  }
  writeFileSync(file, lines.join('\n'), 'utf8')
  return {
    ok: issues.length === 0,
    sources: rows.length,
    primary_verified: primaryVerified,
    secondary,
    restricted: restricted.map((row) => ({ id: row.id, license: row.license })),
    issues,
    report_path: file,
  }
}

function walkFiles(root, base) {
  const files = []
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else files.push(relative(base, full).split(sep).join('/'))
    }
  }
  if (existsSync(root)) walk(root)
  return files.sort()
}

/**
 * Hash build artifacts for reproducibility evidence.
 * @param {string} dir - case directory.
 * @returns {object} manifest with artifact hashes and the manifest path.
 */
export function hashArtifacts(dir) {
  const buildDir = join(dir, 'build')
  const artifacts = []
  for (const rel of walkFiles(buildDir, dir)) {
    const full = join(dir, rel)
    const bytes = statSync(full).size
    const sha256 = createHash('sha256').update(readFileSync(full)).digest('hex')
    artifacts.push({ path: rel, bytes, sha256 })
  }
  mkdirSync(join(dir, 'verification'), { recursive: true })
  const file = join(dir, 'verification', 'repro.json')
  const manifest = { generated_at: new Date().toISOString(), artifacts }
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  return { ok: artifacts.length > 0, artifacts, manifest_path: file }
}

/**
 * Copy the human verification templates into the case.
 * @param {string} dir - case directory.
 * @param {string} peerTemplate - peer review template text.
 * @param {string} pilotTemplate - pilot CSV text.
 */
export function seedVerification(dir, peerTemplate, pilotTemplate, designTemplate) {
  mkdirSync(join(dir, 'verification'), { recursive: true })
  writeFileSync(join(dir, 'verification', 'peer-review.template.md'), peerTemplate, 'utf8')
  writeFileSync(join(dir, 'verification', 'pilot.template.csv'), pilotTemplate, 'utf8')
  if (designTemplate) writeFileSync(join(dir, 'verification', 'trial-design.template.md'), designTemplate, 'utf8')
}

/**
 * Check whether a directory lies inside another directory.
 * @param {string} child - absolute child path.
 * @param {string} parent - absolute parent path.
 * @returns {boolean} true when child is parent or below it.
 */
export function isInside(child, parent) {
  const rel = relative(parent, child)
  return rel === '' || (!rel.startsWith('..') && !rel.includes(`..${sep}`))
}

export { cpSync }
