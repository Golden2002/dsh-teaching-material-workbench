import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { parseYaml } from '../lib/yaml.js'
import { parseCsvTable, stringifyCsv } from '../lib/csv.js'
import { runGate, contrastRatio, auditLanguage } from '../lib/gate.js'
import { buildOutline } from '../lib/outline.js'
import { DEFAULT_PALETTE } from '../lib/templates.js'
import { TOOLS, assertToolSchema } from '../lib/index.js'

function writeFile(dir, name, content) {
  const target = join(dir, name)
  mkdirSync(join(target, '..'), { recursive: true })
  writeFileSync(target, content, 'utf8')
}

function writeCase({ totalMarks = 2, official = false, palette = DEFAULT_PALETTE, teacherPack } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'tmw-case-'))
  writeFile(dir, 'profile.yml', `id: case-001
title: 测试案例
subject: 通用
level: 成人
audience: 学习者
setting: 培训
language: 中文为主
duration_min: 30
delivery: 现场
assessment_regime: 无正式考试
authorities:
  - role: syllabus
    source_id: S01
constraints:
  copyright: 仅本地引用
  accessibility: WCAG 2.2 AA
thresholds:
  body_min_pt: 14
  body_target_pt: 16
  docx_min_pt: 9
  page_max_items: 6
outputs:
  - deck.pptx
`)
  writeFile(dir, 'lesson.yml', `id: case-001
profile: ./profile.yml
title: 测试案例
duration_min: 30
objectives:
  - id: O1
    text: 能说明流程
    command_term: null
    observable: 口头复述
  - id: O2
    text: 能完成练习
    command_term: null
    observable: 提交作业
scope_in:
  - 流程
scope_out:
  - 扩展
assessment:
  type: formative
  total_marks: ${totalMarks}
  question: 说明流程
outputs:
  - deck.pptx
`)
  writeFile(dir, 'sources.csv', `id,title,publisher,date,type,locator,access,license,verified,role,notes
S01,官方指南,机构,2026,primary,p.1,local,own-work,yes,syllabus,
S02,教材章节,出版社,2025,primary,pp.1-2,local,publisher-copyright,yes,textbook,本地引用
S03,公开资料,机构,2026,secondary,第2节,public-web,public-domain,no,other,
`)
  writeFile(dir, 'claims.csv', `id,claim,source_id,locator,status,note
C01,流程分为两步,S01,p.1,supported,
`)
  writeFile(dir, 'knowledge.csv', `concept,source_id,locator,note
Plain language,S01,Guidelines,
`)
  writeFile(dir, 'alignment.csv', `objective,teaching_action,student_activity,assessment,material_ref
O1,讲流程,复述,提问,deck p.1
O2,练习,完成练习,作业,handout p.1
`)
  writeFile(dir, 'rubric.csv', `point,marks,evidence,alternatives,source_id,status
步骤一,1,First step,step one,S01,${official ? 'official' : 'self-authored'}
步骤二,1,Second step,step two,S01,${official ? 'official' : 'self-authored'}
`)
  writeFile(dir, 'timeline.csv', `start,end,segment,teacher,student,output
0,10,开场,讲解,听,
10,30,练习,指导,练习,作业
`)
  writeFile(dir, 'glossary.csv', `en,zh,first_use,definition_source,forbidden
Process,流程,deck p.1,S01,
`)
  writeFile(dir, 'misconceptions.csv', `id,misconception,correct,source_id,severity
M1,把流程当结果,流程是步骤,S01,medium
`)
  writeFile(dir, 'figures.json', `${JSON.stringify({ figures: [] }, null, 2)}\n`)
  writeFile(dir, 'palette.json', `${JSON.stringify(palette, null, 2)}\n`)
  writeFile(
    dir,
    'teacher-pack.md',
    teacherPack ?? `# 测试案例 · 教师实施包

## 时间轴

Process 指本课流程 [S01]。

## 板书

- 左区：流程
- 中区：步骤
- 右区：练习
`,
  )
  mkdirSync(join(dir, 'assets'), { recursive: true })
  mkdirSync(join(dir, 'build'), { recursive: true })
  writeFile(dir, 'build/deck.pptx', 'dummy artifact')
  return dir
}

test('yaml parses mappings, lists and inline lists', () => {
  const value = parseYaml(`id: c1
authorities:
  - role: syllabus
    source_id: S01
  - role: textbook
    source_id: S02
thresholds:
  body_min_pt: 14
tags: [a, b, c]
quoted: "hello: world"
`)
  assert.equal(value.id, 'c1')
  assert.equal(value.authorities.length, 2)
  assert.equal(value.authorities[1].source_id, 'S02')
  assert.equal(value.thresholds.body_min_pt, 14)
  assert.deepEqual(value.tags, ['a', 'b', 'c'])
  assert.equal(value.quoted, 'hello: world')
})

test('csv roundtrip keeps commas and quotes', () => {
  const text = 'id,title\nS01,"A, B"\nS02,"say ""hi"""\n'
  const table = parseCsvTable(text)
  assert.equal(table.rows[0].title, 'A, B')
  assert.equal(table.rows[1].title, 'say "hi"')
  const again = parseCsvTable(stringifyCsv(['id', 'title'], table.rows))
  assert.deepEqual(again.rows, table.rows)
})

test('contrast ratio matches WCAG reference points', () => {
  assert.equal(contrastRatio('#000000', '#FFFFFF').toFixed(2), '21.00')
  assert.ok(contrastRatio('#777777', '#FFFFFF') > 4.4)
  assert.ok(Number.isNaN(contrastRatio('nope', '#FFFFFF')))
})

test('language audit flags missing CJK space and halfwidth punctuation', () => {
  const found = auditLanguage('用Python做练习,再检查。')
  const rules = found.map((entry) => entry.rule)
  assert.ok(rules.includes('中英之间缺空格（中→英）'))
  assert.ok(rules.includes('中文后接半角标点'))
  assert.equal(auditLanguage('用 Python 做练习，再检查。').length, 0)
})

test('a complete case passes data gates and marks human/pilot evidence unexecuted', () => {
  const dir = writeCase()
  try {
    const outcome = runGate(dir)
    assert.equal(outcome.summary.fail, 0, JSON.stringify(outcome.results.filter((entry) => entry.status === 'fail')))
    assert.equal(outcome.summary.skip, 4)
    assert.equal(outcome.summary.pass, 12)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E2-language-paeg' && entry.status === 'skip'))
    assert.ok(outcome.results.some((entry) => entry.gate === 'E2-knowledge' && entry.status === 'pass'))
    assert.ok(outcome.results.some((entry) => entry.gate === 'E2-grounding' && entry.status === 'pass'))
    assert.ok(outcome.results.some((entry) => entry.gate === 'E2-rubric-source' && entry.status === 'skip'))
    assert.ok(outcome.results.some((entry) => entry.gate === 'E3-human' && entry.status === 'skip'))
    assert.ok(outcome.results.some((entry) => entry.gate === 'E3-pilot' && entry.status === 'skip'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('rubric total mismatch fails E1-rubric-sum', () => {
  const dir = writeCase({ totalMarks: 3 })
  try {
    const outcome = runGate(dir)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E1-rubric-sum' && entry.status === 'fail'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('an official rubric row without a mark scheme fails E2-rubric-source', () => {
  const dir = writeCase({ official: true })
  try {
    const outcome = runGate(dir)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E2-rubric-source' && entry.status === 'fail'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('a copyrighted file inside the case fails E2-rights', () => {
  const dir = writeCase()
  try {
    writeFile(dir, 'assets/textbook.pdf', 'not really a pdf')
    const outcome = runGate(dir)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E2-rights' && entry.status === 'fail'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('a low-contrast palette pair fails E2-accessibility', () => {
  const dir = writeCase({
    palette: { pairs: [{ fg: '#999999', bg: '#FFFFFF', usage: '弱对比', min_ratio: 4.5 }] },
  })
  try {
    const outcome = runGate(dir)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E2-accessibility' && entry.status === 'fail'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('missing CJK spacing in the teacher pack fails E2-language', () => {
  const dir = writeCase({ teacherPack: '# 测试案例\n\n用Python做练习。\n' })
  try {
    const outcome = runGate(dir)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E2-language' && entry.status === 'fail'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('an unsupported grounding claim fails E2-grounding', () => {
  const dir = writeCase()
  try {
    writeFile(dir, 'claims.csv', `id,claim,source_id,locator,status,note
C01,流程分为两步,S01,p.1,unsupported,
`)
    const outcome = runGate(dir)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E2-grounding' && entry.status === 'fail'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('a missing claims.csv leaves grounding unexecuted, not failed', () => {
  const dir = writeCase()
  try {
    rmSync(join(dir, 'claims.csv'))
    const outcome = runGate(dir)
    assert.equal(outcome.summary.fail, 0)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E2-grounding' && entry.status === 'skip'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('outline generation writes build/outline.md from case data', () => {
  const dir = writeCase()
  try {
    const result = buildOutline(dir)
    assert.equal(result.ok, true)
    assert.ok(result.slides >= 2)
    const content = readFileSync(result.outline_path, 'utf8')
    assert.match(content, /测试案例 · 课件大纲/)
    assert.match(content, /评分标准/)
    assert.match(content, /知识库定位/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('a coarse locator fails the grounding audit', () => {
  const dir = writeCase()
  try {
    writeFile(dir, 'claims.csv', `id,claim,source_id,locator,status,note
C01,流程分为两步,S01,p.,supported,
`)
    const outcome = runGate(dir)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E2-grounding' && entry.status === 'fail'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('an invalid knowledge map fails E2-knowledge', () => {
  const dir = writeCase()
  try {
    writeFile(dir, 'knowledge.csv', `concept,source_id,locator,note
Plain language,S99,Guidelines,
`)
    const outcome = runGate(dir)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E2-knowledge' && entry.status === 'fail'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('an unfilled pilot template fails E3-pilot instead of passing', () => {
  const dir = writeCase()
  try {
    writeFile(dir, 'verification/pilot.csv', `id,item,metric,value,n,design,note
P01,前测平均分,mean,,,single-blind,
`)
    const outcome = runGate(dir)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E3-pilot' && entry.status === 'fail'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('pilot data without a trial design fails E3-pilot', () => {
  const dir = writeCase()
  try {
    writeFile(dir, 'verification/pilot.csv', `id,item,metric,value,n,design,note
P01,前测平均分,mean,12,30,single-blind,
`)
    const outcome = runGate(dir)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E3-pilot' && entry.status === 'fail'))
    assert.match(outcome.results.find((entry) => entry.gate === 'E3-pilot').detail, /trial-design/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('pilot data with a trial design passes E3-pilot', () => {
  const dir = writeCase()
  try {
    writeFile(dir, 'verification/pilot.csv', `id,item,metric,value,n,design,note
P01,前测平均分,mean,12,30,single-blind,
`)
    writeFile(dir, 'verification/trial-design.md', `# 试点设计
- 研究问题：改写练习是否提升邮件清晰度
- 分组：单组前后测
- 盲法：单盲
- 评分者：两名独立评分
- 样本量依据：一个班 30 人
- 主要指标：前后测均分
- 分析计划：配对比较
`)
    const outcome = runGate(dir)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E3-pilot' && entry.status === 'pass'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('every tool execute entry point works end to end', async () => {
  const dir = writeCase()
  const initDir = mkdtempSync(join(tmpdir(), 'tmw-init-'))
  const byName = Object.fromEntries(TOOLS.map((tool) => [tool.name, tool]))
  try {
    const init = await byName.teaching_material_init.execute({
      directory: initDir,
      title: '端到端案例',
      subject: '测试学科',
      level: '成人学习者',
      audience: '学习者',
      setting: '培训',
    })
    assert.equal(init.ok, true)
    assert.ok(init.files.includes('knowledge.csv'))
    assert.ok(existsSync(join(initDir, 'verification', 'trial-design.template.md')))
    const gate = await byName.teaching_material_gate.execute({ directory: dir, write_report: false })
    assert.equal(gate.summary.fail, 0)
    const ground = await byName.teaching_material_ground.execute({ directory: dir })
    assert.equal(ground.ok, true)
    const outline = await byName.teaching_material_outline.execute({ directory: dir })
    assert.equal(outline.ok, true)
    const audit = await byName.teaching_material_audit.execute({ directory: dir })
    assert.equal(audit.ok, true)
    const repro = await byName.teaching_material_repro.execute({ directory: dir })
    assert.equal(repro.ok, true)
    const standards = await byName.teaching_material_standards.execute({ topic: 'WCAG' })
    assert.ok(standards.count >= 1)
  } finally {
    rmSync(dir, { recursive: true, force: true })
    rmSync(initDir, { recursive: true, force: true })
  }
})

test('a language.md with PAEG violations fails E2-language-paeg', () => {
  const dir = writeCase()
  try {
    writeFile(dir, 'language.md', '# 学生讲义\n\n说白了，先记住这一点，你会发现很简单。\n')
    const outcome = runGate(dir)
    assert.ok(outcome.results.some((entry) => entry.gate === 'E2-language-paeg' && entry.status === 'fail'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('bundle manifest carries the community-required fields', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(pkg.name, 'dsh-teaching-material-workbench')
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.ok(pkg.files.includes('lib/'))
  assert.ok(pkg.files.includes('icon.svg'))
  assert.ok(pkg.files.includes('locale/*.json'))
  assert.equal(pkg.scripts.test, 'node --test tests/*.test.js')
  assert.equal(pkg.scripts.postinstall, undefined)
  assert.equal(pkg.scripts.prepare, undefined)
  assert.ok(pkg.engines.dsh)
  const patch = readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
  assert.match(patch, /id: teaching-material-workbench/)
  for (const locale of ['en', 'zh']) {
    const data = JSON.parse(readFileSync(new URL(`../locale/${locale}.json`, import.meta.url), 'utf8'))
    assert.ok(data.meta.title.length > 0)
    assert.ok(data.meta.description.length > 0)
  }
  const icon = readFileSync(new URL('../icon.svg', import.meta.url), 'utf8')
  assert.match(icon, /^<svg[\s>]/)
  assert.ok(existsSync(new URL('../skills/teaching-material-workbench/SKILL.md', import.meta.url)))
})

test('community index example follows format 1', () => {
  const index = JSON.parse(readFileSync(new URL('../community/index.example.json', import.meta.url), 'utf8'))
  assert.equal(index.format, 1)
  assert.ok(index.title.en)
  assert.equal(index.plugins.length, 1)
  assert.equal(index.plugins[0].name, 'dsh-teaching-material-workbench')
  const version = index.plugins[0].versions[0]
  assert.match(version.version, /^\d+\.\d+\.\d+$/)
  assert.ok(Number.isInteger(version.publishTimestamp))
  assert.ok(['npm', 'git'].includes(version.source.type))
})

test('every tool schema is valid for the model-facing function validator', () => {
  for (const tool of TOOLS) {
    assert.doesNotThrow(() => assertToolSchema(tool), tool.name)
    assert.equal(tool.parameters.type, 'object')
    assert.ok(Array.isArray(tool.parameters.required), `${tool.name}: required must be an array`)
    assert.equal(typeof tool.output.schema, 'object')
    assert.equal(typeof tool.output.render, 'function')
    assert.equal(typeof tool.execute, 'function')
  }
  const broken = {
    name: 'broken',
    description: '',
    parameters: { type: 'object', properties: { directory: { type: 'string', required: true } }, required: ['directory'] },
  }
  assert.throws(() => assertToolSchema(broken), /required must not exist/)
  const badAdditional = {
    name: 'bad-additional',
    description: '',
    parameters: { type: 'object', properties: { counts: { type: 'object', additionalProperties: { type: 'integer' } } }, required: [] },
  }
  assert.throws(() => assertToolSchema(badAdditional), /additionalProperties must be a boolean/)
})
