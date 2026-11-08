/**
 * dsh-teaching-material-workbench — Host plugin entry.
 *
 * Registers seven tools and one runtime skill:
 *   - teaching_material_init      scaffold a case (context profile + data files)
 *   - teaching_material_gate      run E1/E2/E3 gates and write gate-report.md
 *   - teaching_material_ground    audit claim-level grounding and write grounding-report.md
 *   - teaching_material_outline   generate build/outline.md from case data
 *   - teaching_material_audit     audit sources and rights, write rights-report.md
 *   - teaching_material_repro     hash build artifacts, write repro.json
 *   - teaching_material_standards return the external standards register
 *
 * Zero runtime dependencies: node built-ins only. No install scripts, no
 * network access, no telemetry.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runGate, writeGateReport, auditSources, hashArtifacts, seedVerification, analyzeGrounding, writeGroundingReport } from './gate.js'
import { buildOutline } from './outline.js'
import { draftPages, exportPages, listHistory, loadPages, restoreHistory, savePages } from './pages.js'
import { API_PREFIX, createWorkbenchHandler } from './workbench-api.js'
import { applyReplacements, checkDocument, languageInfo } from './language.js'
import { listStandards } from './standards.js'
import {
  CSV_HEADERS,
  DEFAULT_PALETTE,
  PEER_REVIEW_TEMPLATE,
  PILOT_TEMPLATE,
  TRIAL_DESIGN_TEMPLATE,
  caseReadme,
  lessonYaml,
  profileYaml,
  slugify,
  teacherPack,
} from './templates.js'

const SKILL_NAME = 'teaching-material-workbench'
const SKILL_DESCRIPTION =
  'Evidence-gated production of teaching materials with a Web UI: context profile, primary-source register, claim-level grounding, knowledge map, deterministic outline, PAEG language checks, layered gates (E1/E2/E3), rights audit, reproducibility. Use when creating or reviewing a lesson, handout, deck, or teacher pack.'

const SKILL_PATH = fileURLToPath(new URL('../skills/teaching-material-workbench/SKILL.md', import.meta.url))

const SKILL_FALLBACK = `---
name: teaching-material-workbench
description: ${SKILL_DESCRIPTION}
---

# Teaching material workbench

1. Call teaching_material_init with an absolute directory to scaffold a case.
2. Fill profile.yml, lesson.yml, sources.csv, alignment.csv, rubric.csv, timeline.csv, glossary.csv, misconceptions.csv.
3. Generate build/deck.pptx and build/handout.docx with any tool; write teacher-pack.md.
4. Run teaching_material_gate. Fix data, never loosen the gate.
5. Run teaching_material_audit and teaching_material_repro.
6. Record human review and pilot evidence, or keep them marked "未执行".
`

function readSkill() {
  try {
    return readFileSync(SKILL_PATH, 'utf8')
  } catch {
    return SKILL_FALLBACK
  }
}

function requireDirectory(value) {
  const raw = String(value ?? '').trim()
  if (!raw) throw new Error('directory is required')
  if (!isAbsolute(raw)) throw new Error('directory must be an absolute path')
  return resolve(raw)
}

function text(value) {
  return [{ type: 'text', text: value }]
}

function summarize(outcome) {
  return `通过 ${outcome.summary.pass} / 不通过 ${outcome.summary.fail} / 未执行 ${outcome.summary.skip}`
}

const DIRECTORY_PARAM = {
  type: 'string',
  description: 'Absolute path of the case directory (绝对路径).',
}

const INIT_TOOL = {
  name: 'teaching_material_init',
  description:
    'Create a teaching-material case scaffold in an absolute directory: context profile, lesson data, source register, alignment, rubric, timeline, glossary, misconceptions, palette, teacher pack and verification templates. 在工作目录建立一个案例骨架。',
  parameters: {
    type: 'object',
    properties: {
      directory: { ...DIRECTORY_PARAM },
      title: { type: 'string', description: 'Case title (课程或培训名称).' },
      subject: { type: 'string', description: 'Subject or domain (学科或领域).' },
      level: { type: 'string', description: 'Level or learner stage (学段或层级).' },
      audience: { type: 'string', description: 'Learner group (学习者).' },
      setting: { type: 'string', description: 'Education or training setting (教育或培训场景).' },
      duration_min: { type: 'number', description: 'Duration in minutes. Default 45.' },
      language: { type: 'string', description: 'Language policy. Default 中文为主.' },
      assessment_regime: { type: 'string', description: 'Assessment regime or "无正式考试".' },
      id: { type: 'string', description: 'Optional kebab-case case id.' },
    },
    required: ['directory', 'title', 'subject', 'level', 'audience', 'setting'],
  },
  output: {
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        directory: { type: 'string' },
        files: { type: 'array', items: { type: 'string' } },
        next: { type: 'array', items: { type: 'string' } },
      },
      required: ['ok', 'directory', 'files'],
    },
    render: (_args, value) => text([
      `案例已建立：${value.directory}`,
      `文件 ${value.files.length} 个：${value.files.join('、')}`,
      '下一步：',
      ...(value.next ?? []).map((entry) => `- ${entry}`),
    ].join('\n')),
  },
  async execute(args) {
    const dir = requireDirectory(args.directory)
    if (existsSync(join(dir, 'lesson.yml'))) throw new Error(`case already exists: ${dir}`)
    const id = String(args.id ?? slugify(args.title))
    const input = {
      id,
      title: String(args.title),
      subject: String(args.subject),
      level: String(args.level),
      audience: String(args.audience),
      setting: String(args.setting),
      language: String(args.language ?? '中文为主'),
      duration_min: Number(args.duration_min ?? 45),
      delivery: '现场授课',
      assessment_regime: String(args.assessment_regime ?? '无正式考试'),
      assessment_type: 'formative',
      authorities: [],
    }
    mkdirSync(dir, { recursive: true })
    mkdirSync(join(dir, 'assets'), { recursive: true })
    mkdirSync(join(dir, 'build'), { recursive: true })
    mkdirSync(join(dir, 'verification'), { recursive: true })
    const files = {
      'profile.yml': profileYaml(input),
      'lesson.yml': lessonYaml(input),
      'language.md': `# 学生可见文本样张

把学生将看到的讲义正文放在这里，供 E2-language-paeg 检查。检查只覆盖可枚举的违禁词、标点、数字与语体问题；比喻、长句与术语一致性仍需人工终审。
`,
      'sources.csv': `${CSV_HEADERS.sources.join(',')}\n`,
      'claims.csv': `${CSV_HEADERS.claims.join(',')}\n`,
      'knowledge.csv': `${CSV_HEADERS.knowledge.join(',')}\n`,
      'alignment.csv': `${CSV_HEADERS.alignment.join(',')}\n`,
      'rubric.csv': `${CSV_HEADERS.rubric.join(',')}\n`,
      'timeline.csv': `${CSV_HEADERS.timeline.join(',')}\n`,
      'glossary.csv': `${CSV_HEADERS.glossary.join(',')}\n`,
      'misconceptions.csv': `${CSV_HEADERS.misconceptions.join(',')}\n`,
      'figures.json': `${JSON.stringify({ figures: [] }, null, 2)}\n`,
      'palette.json': `${JSON.stringify(DEFAULT_PALETTE, null, 2)}\n`,
      'teacher-pack.md': teacherPack(input),
      'README.md': caseReadme(input),
      'assets/.gitkeep': '',
      'build/.gitkeep': '',
    }
    for (const [name, content] of Object.entries(files)) {
      const target = join(dir, name)
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, content, 'utf8')
    }
    seedVerification(dir, PEER_REVIEW_TEMPLATE, PILOT_TEMPLATE, TRIAL_DESIGN_TEMPLATE)
    return {
      ok: true,
      directory: dir,
      files: Object.keys(files).concat(['verification/peer-review.template.md', 'verification/pilot.template.csv', 'verification/trial-design.template.md']),
      next: [
        '填 profile.yml 的 authorities 与 lesson.yml 的目标、评估。',
        '填 sources.csv：发布方、日期、定位、获取方式、许可、核验状态；二手只用来定位一手。',
        '填 claims.csv：每条实质结论写 claim、source_id、locator、status（supported/partial/unsupported）。',
        '可选：填 language.md，放学生可见正文，E2-language-paeg 会按 PAEG 教学语言规范检查。',
        '可选：填 knowledge.csv，把关键概念映射到来源与定位（缺省时 E2-knowledge 记未执行）。',
        '生成 build/ 产物并写 teacher-pack.md（引用来源写 [S01]），然后调用 teaching_material_gate。',
        '需要课件大纲时调用 teaching_material_outline；需要接地审计时调用 teaching_material_ground。',
        '人工评审与试点做不到时保留未执行，不要写成通过。',
      ],
    }
  },
}

const GATE_TOOL = {
  name: 'teaching_material_gate',
  description:
    'Run layered gates on a case directory: schema and arithmetic (E1), source register, official rubric authority, WCAG accessibility, language, rights (E2), and human review / pilot evidence (E3). Writes gate-report.md. 按三层验证跑门禁。',
  parameters: {
    type: 'object',
    properties: {
      directory: { ...DIRECTORY_PARAM },
      write_report: { type: 'boolean', description: 'Write gate-report.md. Default true.' },
    },
    required: ['directory'],
  },
  output: {
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        directory: { type: 'string' },
        summary: {
          type: 'object',
          properties: {
            pass: { type: 'integer' },
            fail: { type: 'integer' },
            skip: { type: 'integer' },
          },
          required: ['pass', 'fail', 'skip'],
        },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              gate: { type: 'string' },
              layer: { type: 'string' },
              basis: { type: 'string' },
              status: { type: 'string' },
              detail: { type: 'string' },
            },
            required: ['gate', 'layer', 'basis', 'status', 'detail'],
          },
        },
        report_path: { type: 'string' },
      },
      required: ['ok', 'directory', 'summary', 'results'],
    },
    render: (_args, value) => {
      const lines = [`门禁：${summarize(value)}`]
      for (const entry of value.results) {
        lines.push(`${entry.status.toUpperCase().padEnd(4)} ${entry.gate} [${entry.layer}] ${entry.detail}`)
      }
      if (value.report_path) lines.push(`报告：${value.report_path}`)
      return text(lines.join('\n'))
    },
  },
  async execute(args) {
    const dir = requireDirectory(args.directory)
    const outcome = runGate(dir)
    let reportPath
    if (args.write_report !== false) reportPath = writeGateReport(dir, outcome)
    return {
      ok: outcome.summary.fail === 0,
      directory: dir,
      summary: outcome.summary,
      results: outcome.results,
      ...(reportPath ? { report_path: reportPath } : {}),
    }
  },
}

const AUDIT_TOOL = {
  name: 'teaching_material_audit',
  description:
    'Audit the source register and rights: field completeness, verified primary sources, restricted licences, and whether original copyrighted files sit in the case directory. Writes verification/rights-report.md. 审计来源与版权。',
  parameters: {
    type: 'object',
    properties: {
      directory: { ...DIRECTORY_PARAM },
    },
    required: ['directory'],
  },
  output: {
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        sources: { type: 'integer' },
        primary_verified: { type: 'integer' },
        secondary: { type: 'integer' },
        restricted: {
          type: 'array',
          items: {
            type: 'object',
            properties: { id: { type: 'string' }, license: { type: 'string' } },
            required: ['id', 'license'],
          },
        },
        issues: { type: 'array', items: { type: 'string' } },
        report_path: { type: 'string' },
      },
      required: ['ok', 'sources', 'primary_verified', 'issues'],
    },
    render: (_args, value) => {
      const lines = [
        `来源 ${value.sources} 条；已核验一手 ${value.primary_verified} 条；二手 ${value.secondary ?? 0} 条。`,
      ]
      if (value.restricted?.length) lines.push(`受限来源：${value.restricted.map((entry) => `${entry.id}(${entry.license})`).join('、')}`)
      if (value.issues?.length) {
        lines.push('问题：')
        for (const issue of value.issues) lines.push(`- ${issue}`)
      } else {
        lines.push('未发现问题。')
      }
      if (value.report_path) lines.push(`报告：${value.report_path}`)
      return text(lines.join('\n'))
    },
  },
  async execute(args) {
    return auditSources(requireDirectory(args.directory))
  },
}

const REPRO_TOOL = {
  name: 'teaching_material_repro',
  description:
    'Hash every build artifact (SHA-256) and write verification/repro.json, so a rebuild can be compared instead of trusted. 记录产物哈希。',
  parameters: {
    type: 'object',
    properties: {
      directory: { ...DIRECTORY_PARAM },
    },
    required: ['directory'],
  },
  output: {
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        artifacts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              bytes: { type: 'integer' },
              sha256: { type: 'string' },
            },
            required: ['path', 'bytes', 'sha256'],
          },
        },
        manifest_path: { type: 'string' },
      },
      required: ['ok', 'artifacts'],
    },
    render: (_args, value) => {
      const lines = value.artifacts.length === 0 ? ['build/ 下没有产物。'] : value.artifacts.map((entry) => `${entry.sha256.slice(0, 16)}… ${entry.path} (${entry.bytes} B)`)
      if (value.manifest_path) lines.push(`清单：${value.manifest_path}`)
      return text(lines.join('\n'))
    },
  },
  async execute(args) {
    return hashArtifacts(requireDirectory(args.directory))
  },
}

const GROUND_TOOL = {
  name: 'teaching_material_ground',
  description:
    'Claim-level grounding audit: every row in claims.csv must name an existing source and a locator, unsupported claims must be removed, and the teacher pack must carry [Sxx] markers. Writes verification/grounding-report.md. 知识库接地审计，对齐检索增强式 AI 助教做法。',
  parameters: {
    type: 'object',
    properties: {
      directory: { ...DIRECTORY_PARAM },
    },
    required: ['directory'],
  },
  output: {
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        claims: { type: 'integer' },
        supported: { type: 'integer' },
        partial: { type: 'integer' },
        unsupported: { type: 'integer' },
        coverage: { type: 'number' },
        cited_markers: { type: 'integer' },
        issues: { type: 'array', items: { type: 'string' } },
        report_path: { type: 'string' },
      },
      required: ['ok', 'claims', 'supported', 'partial', 'unsupported', 'coverage', 'issues'],
    },
    render: (_args, value) => {
      const lines = [
        `结论 ${value.claims} 条：supported ${value.supported}，partial ${value.partial}，unsupported ${value.unsupported}；覆盖率 ${(value.coverage * 100).toFixed(1)}%。`,
        `teacher-pack 引用标记 ${value.cited_markers} 处。`,
      ]
      if (value.issues?.length) {
        lines.push('问题：')
        for (const issue of value.issues) lines.push(`- ${issue}`)
      } else {
        lines.push('没有未接地的结论。')
      }
      if (value.report_path) lines.push(`报告：${value.report_path}`)
      return text(lines.join('\n'))
    },
  },
  async execute(args) {
    const dir = requireDirectory(args.directory)
    const analysis = analyzeGrounding(dir)
    const reportPath = writeGroundingReport(dir, analysis)
    return {
      ok: analysis.rows > 0 && analysis.unsupported === 0 && analysis.issues.length === 0 && analysis.cited_markers > 0,
      claims: analysis.rows,
      supported: analysis.supported,
      partial: analysis.partial,
      unsupported: analysis.unsupported,
      coverage: analysis.coverage,
      cited_markers: analysis.cited_markers,
      issues: analysis.issues,
      report_path: reportPath,
    }
  },
}

const OUTLINE_TOOL = {
  name: 'teaching_material_outline',
  description:
    'Generate a deterministic slide-by-slide Markdown outline from lesson.yml, timeline.csv, rubric.csv, glossary.csv and sources.csv; writes build/outline.md. 由结构化数据生成课件大纲，供课件工具排版。',
  parameters: {
    type: 'object',
    properties: {
      directory: { ...DIRECTORY_PARAM },
    },
    required: ['directory'],
  },
  output: {
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        outline_path: { type: 'string' },
        slides: { type: 'integer' },
        timeline_rows: { type: 'integer' },
      },
      required: ['ok', 'outline_path', 'slides', 'timeline_rows'],
    },
    render: (_args, value) => text(`大纲已生成：${value.outline_path}\n页数 ${value.slides}；时间轴 ${value.timeline_rows} 段。`),
  },
  async execute(args) {
    return buildOutline(requireDirectory(args.directory))
  },
}

const LANGUAGE_TOOL = {
  name: 'teaching_language_check',
  description:
    'Run the PAEG teaching-language rules on a text or on a case language.md: forbidden wording, half-width punctuation, number format, imperative and second-person register. Returns violations with file:line, counts, and a mechanical replacement preview. 按教学语言规范检查中文教学文本。',
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'Text to check. Omit when directory is given.' },
      directory: { type: 'string', description: 'Absolute case directory; checks language.md or the file named by file.' },
      file: { type: 'string', description: 'File inside the case directory. Default language.md.' },
    },
    required: [],
  },
  output: {
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        violations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              rule: { type: 'string' },
              where: { type: 'string' },
              hit: { type: 'string' },
              sample: { type: 'string' },
              advice: { type: 'string' },
            },
            required: ['category', 'rule', 'where', 'hit', 'advice'],
          },
        },
        counts: { type: 'object' },
        fixes: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            changes: {
              type: 'array',
              items: {
                type: 'object',
                properties: { from: { type: 'string' }, to: { type: 'string' }, count: { type: 'integer' } },
                required: ['from', 'to', 'count'],
              },
            },
          },
          required: ['text', 'changes'],
        },
        info: { type: 'object' },
      },
      required: ['ok', 'violations', 'counts', 'fixes'],
    },
    render: (_args, value) => {
      const lines = [
        `语言检查：${value.violations.length} 处；规则库 ${value.info?.forbidden ?? '?'} 条违禁词 / ${value.info?.replacements ?? '?'} 条替换。`,
      ]
      for (const item of value.violations.slice(0, 40)) {
        lines.push(`[${item.category}] ${item.rule} · ${item.where} · 命中「${item.hit}」${item.advice ? ` → ${item.advice}` : ''}`)
      }
      if (value.fixes.changes.length > 0) {
        lines.push(`可机械替换：${value.fixes.changes.map((item) => `${item.from}→${item.to}`).join('、')}`)
      }
      return text(lines.join('\n'))
    },
  },
  async execute(args) {
    let content
    let name
    if (typeof args.text === 'string' && args.text.trim() !== '') {
      content = args.text
      name = 'text.md'
    } else {
      const dir = requireDirectory(args.directory)
      const rel = String(args.file ?? 'language.md').replaceAll('\\', '/')
      const full = resolve(dir, rel)
      if (!full.startsWith(`${resolve(dir)}${sep}`) && full !== resolve(dir)) throw new Error('file escapes the case directory')
      if (!existsSync(full)) throw new Error(`file not found: ${rel}`)
      content = readFileSync(full, 'utf8')
      name = rel
    }
    const violations = checkDocument(name, content)
    const fixes = applyReplacements(content)
    const counts = {}
    for (const item of violations) counts[item.category] = (counts[item.category] ?? 0) + 1
    return { ok: violations.length === 0, violations, counts, fixes, info: languageInfo() }
  },
}

const PAGES_TOOL = {
  name: 'teaching_material_pages',
  description:
    'Read, draft or save the page model (pages.json): one timeline segment becomes one page with slide bullets, handout paragraphs, notes and sources. Drafts come from timeline.csv; saving regenerates build/outline.md and creates a history version. 生成或保存逐页数据。',
  parameters: {
    type: 'object',
    properties: {
      directory: { type: 'string', description: 'Absolute case directory.' },
      action: { type: 'string', enum: ['get', 'draft', 'save', 'history', 'restore'], description: 'get saved pages, draft from timeline, save pages, list history, or restore a version.' },
      pages: { type: 'array', items: { type: 'object' }, description: 'Page array for action=save.' },
      revision: { type: 'number', description: 'Expected revision for optimistic locking.' },
      version: { type: 'string', description: 'History version id for action=restore.' },
    },
    required: ['directory', 'action'],
  },
  output: {
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        saved: { type: 'object' },
        draft: { type: 'object' },
        revision: { type: 'number' },
        version_id: { type: 'string' },
        versions: { type: 'array', items: { type: 'object' } },
        restored: { type: 'array', items: { type: 'string' } },
      },
      required: ['ok'],
    },
    render: (_args, value) => {
      if (Array.isArray(value.versions)) return text(`历史版本 ${value.versions.length} 个：${value.versions.slice(0, 5).map((item) => item.id).join('、')}`)
      if (value.draft) return text(`页草稿 ${value.draft.pages?.length ?? 0} 页${value.draft.warnings?.length ? `；提示：${value.draft.warnings.join('；')}` : ''}`)
      if (value.restored) return text(`已恢复：${value.restored.join('、')}`)
      return text(`已保存 pages.json，revision ${value.revision ?? '?'}，版本 ${value.version_id ?? ''}`)
    },
  },
  async execute(args) {
    const dir = requireDirectory(args.directory)
    if (args.action === 'get') return { ok: true, saved: loadPages(dir), draft: draftPages(dir) }
    if (args.action === 'draft') return { ok: true, draft: draftPages(dir) }
    if (args.action === 'history') return { ok: true, versions: listHistory(dir) }
    if (args.action === 'restore') return { ok: true, ...restoreHistory(dir, args.version) }
    if (args.action === 'save') return { ok: true, ...savePages(dir, args.pages, args.revision) }
    throw new Error(`unknown action: ${args.action}`)
  },
}

const EXPORT_TOOL = {
  name: 'teaching_material_export',
  description:
    'Export the page model to derived materials: handbook Markdown, deck Markdown, storyboard, Manim scene scripts, and — when Python plus python-docx/python-pptx exist — DOCX and PPTX. Missing helpers are reported as degraded rather than faked. 导出讲义、课件与媒体脚本。',
  parameters: {
    type: 'object',
    properties: {
      directory: { type: 'string', description: 'Absolute case directory.' },
      targets: { type: 'array', items: { type: 'string', enum: ['all', 'handout', 'deck', 'storyboard', 'manim', 'docx', 'pptx'] }, description: 'Export targets. Defaults to all.' },
    },
    required: ['directory'],
  },
  output: {
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        artifacts: {
          type: 'array',
          items: {
            type: 'object',
            properties: { path: { type: 'string' }, sha256: { type: 'string' }, bytes: { type: 'integer' } },
            required: ['path', 'sha256'],
          },
        },
        degraded_reason: { type: 'array', items: { type: 'string' } },
      },
      required: ['ok', 'artifacts', 'degraded_reason'],
    },
    render: (_args, value) => {
      const lines = [`导出 ${value.artifacts.length} 个文件：${value.artifacts.map((item) => item.path.split(/[\\/]/).pop()).join('、')}`]
      for (const reason of value.degraded_reason) lines.push(`降级/未完成：${reason}`)
      return text(lines.join('\n'))
    },
  },
  async execute(args) {
    const dir = requireDirectory(args.directory)
    const targets = Array.isArray(args.targets) && args.targets.length > 0 ? args.targets : ['all']
    return exportPages(dir, targets)
  },
}

const STANDARDS_TOOL = {
  name: 'teaching_material_standards',
  description:
    'List the external standards register the workbench cites (WCAG 2.2, UDL 3.0, QM rubric, OSCQR, ISO 24495-1, GB/T 15834, PDF/UA, key research DOIs) with honest status: verified, partial, or not-obtained. 返回外部依据登记表。',
  parameters: {
    type: 'object',
    properties: {
      topic: { type: 'string', description: 'Optional case-insensitive filter.' },
    },
    required: [],
  },
  output: {
    schema: {
      type: 'object',
      properties: {
        count: { type: 'integer' },
        standards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              clauses: { type: 'array', items: { type: 'string' } },
              use: { type: 'string' },
              status: { type: 'string' },
              url: { type: 'string' },
              doi: { type: 'string' },
            },
            required: ['id', 'title', 'status', 'use'],
          },
        },
      },
      required: ['count', 'standards'],
    },
    render: (_args, value) => {
      const lines = [`外部依据 ${value.count} 条`]
      for (const entry of value.standards) {
        lines.push(`- [${entry.status}] ${entry.id}：${entry.title}${entry.doi ? ` DOI:${entry.doi}` : entry.url ? ` ${entry.url}` : ''}`)
      }
      return text(lines.join('\n'))
    },
  },
  async execute(args) {
    const standards = listStandards(args.topic)
    return { count: standards.length, standards }
  },
}

const TOOLS = [INIT_TOOL, GATE_TOOL, AUDIT_TOOL, REPRO_TOOL, GROUND_TOOL, OUTLINE_TOOL, PAGES_TOOL, EXPORT_TOOL, LANGUAGE_TOOL, STANDARDS_TOOL]

export { TOOLS }

/**
 * Reject a tool schema that the model-facing function validator would refuse.
 * JSON Schema `required` belongs to the object schema as an array; a boolean
 * `required` inside a property is the exact defect this guard exists for.
 * @param {object} tool - tool definition.
 */
export function assertToolSchema(tool) {
  if (!tool || typeof tool.name !== 'string' || tool.name.length === 0) throw new Error('tool name is required')
  const params = tool.parameters
  if (!params || typeof params !== 'object' || params.type !== 'object') throw new Error(`${tool.name}: parameters must be an object schema`)
  if (!Array.isArray(params.required)) throw new Error(`${tool.name}: parameters.required must be an array`)
  for (const name of params.required) {
    if (!params.properties || !(name in params.properties)) throw new Error(`${tool.name}: required field ${name} has no property schema`)
  }
  const walk = (node, path) => {
    if (!node || typeof node !== 'object') return
    if (Object.hasOwn(node, 'required') && path !== '$') throw new Error(`${tool.name}: ${path}.required must not exist inside a property schema`)
    if (Object.hasOwn(node, 'additionalProperties') && typeof node.additionalProperties !== 'boolean') throw new Error(`${tool.name}: ${path}.additionalProperties must be a boolean`)
    if (Array.isArray(node.oneOf)) node.oneOf.forEach((member, index) => walk(member, `${path}.oneOf[${index}]`))
    if (node.properties) {
      for (const [key, child] of Object.entries(node.properties)) walk(child, `${path}.properties.${key}`)
    }
    if (node.items) walk(node.items, `${path}.items`)
  }
  walk(params, '$')
}

export const name = 'teaching-material-workbench'
export const inject = ['tools']

/**
 * Activate the plugin.
 * @param {import('@deepseek-ai/cordis').Context} ctx - Cordis context.
 */
export function apply(ctx) {
  for (const tool of TOOLS) {
    assertToolSchema(tool)
    ctx.effect(() => ctx.tools.register(tool), `teaching-material-workbench: ${tool.name}`)
  }
  const skills = ctx.get('skills')
  if (skills && typeof skills.register === 'function') {
    ctx.effect(
      () =>
        skills.register({
          name: SKILL_NAME,
          description: SKILL_DESCRIPTION,
          content: readSkill(),
          source: 'bundled',
          invocation: { modelInvocable: true, userInvocable: true },
        }),
      `teaching-material-workbench: skill ${SKILL_NAME}`,
    )
  }
  const webServer = ctx.get('webServer')
  if (webServer && typeof webServer.register === 'function') {
    ctx.effect(
      () => webServer.register({ kind: 'prefix', path: API_PREFIX, handler: createWorkbenchHandler() }),
      'teaching-material-workbench: web api',
    )
  }
}
