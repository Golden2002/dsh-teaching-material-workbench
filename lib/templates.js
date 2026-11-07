/** Scaffold contents written by the init tool. */

export const CSV_HEADERS = {
  sources: ['id', 'title', 'publisher', 'date', 'type', 'locator', 'access', 'license', 'verified', 'role', 'notes'],
  claims: ['id', 'claim', 'source_id', 'locator', 'status', 'note'],
  knowledge: ['concept', 'source_id', 'locator', 'note'],
  alignment: ['objective', 'teaching_action', 'student_activity', 'assessment', 'material_ref'],
  rubric: ['point', 'marks', 'evidence', 'alternatives', 'source_id', 'status'],
  timeline: ['start', 'end', 'segment', 'teacher', 'student', 'output'],
  glossary: ['en', 'zh', 'first_use', 'definition_source', 'forbidden'],
  misconceptions: ['id', 'misconception', 'correct', 'source_id', 'severity'],
}

export const DEFAULT_PALETTE = {
  pairs: [
    { fg: '#12314F', bg: '#FFFFFF', usage: '正文深色字与白底', min_ratio: 4.5 },
    { fg: '#54657A', bg: '#FFFFFF', usage: '次要说明文字', min_ratio: 4.5 },
    { fg: '#FFFFFF', bg: '#12314F', usage: '深色块上的白字', min_ratio: 4.5 },
    { fg: '#FFFFFF', bg: '#1F7A8C', usage: '青色小节条上的白字', min_ratio: 4.5 },
  ],
  notes: 'WCAG 2.2 SC 1.4.3：正文 4.5:1，大字 3:1。新增配色后重跑门禁。',
}

/**
 * Turn arbitrary text into a kebab-case id.
 * @param {string} text - source text.
 * @returns {string} kebab-case id.
 */
export function slugify(text) {
  const ascii = String(text)
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return ascii || `case-${Date.now().toString(36)}`
}

/**
 * Context profile for one case.
 * @param {object} input - scaffold input.
 * @returns {string} YAML text.
 */
export function profileYaml(input) {
  const authorities = (input.authorities ?? []).map((entry) => `  - role: ${entry.role}\n    source_id: ${entry.source_id}`).join('\n')
  return `id: ${input.id}
title: ${input.title}
subject: ${input.subject}
level: ${input.level}
audience: ${input.audience}
setting: ${input.setting}
language: ${input.language}
duration_min: ${input.duration_min}
delivery: ${input.delivery ?? '现场授课'}
assessment_regime: ${input.assessment_regime}
authorities:${authorities ? `\n${authorities}` : ' []'}
constraints:
  copyright: 受版权保护材料只本地引用，不入库
  accessibility: WCAG 2.2 AA：替代文本、对比度、文本可缩放
thresholds:
  body_min_pt: 14
  body_target_pt: 16
  docx_min_pt: 9
  page_max_items: 6
outputs:
  - deck.pptx
  - handout.docx
  - teacher-pack.md
`
}

/**
 * Lesson data for one case.
 * @param {object} input - scaffold input.
 * @returns {string} YAML text.
 */
export function lessonYaml(input) {
  return `id: ${input.id}
profile: ./profile.yml
title: ${input.title}
duration_min: ${input.duration_min}
objectives:
  - id: O1
    text: 待填写：一条可观察的学习目标
    command_term: null
    observable: 待填写：学生做到什么算达成
  - id: O2
    text: 待填写：第二条目标
    command_term: null
    observable: 待填写
scope_in:
  - 待填写
scope_out:
  - 待填写
assessment:
  type: ${input.assessment_type ?? 'formative'}
  total_marks: 0
  question: 待填写
outputs:
  - deck.pptx
  - handout.docx
  - teacher-pack.md
`
}

/**
 * Teacher implementation pack.
 * @param {object} input - scaffold input.
 * @returns {string} Markdown text.
 */
export function teacherPack(input) {
  return `# ${input.title} · 教师实施包

> 这是脚手架。填完 lesson.yml、timeline.csv、rubric.csv 后按时间轴核对本页。

## 时间轴

| 起 | 止 | 环节 | 教师做什么 | 学生做什么 | 产出 |
|---|---|---|---|---|---|
| 0 | 待填 | 开场 | 待填 | 待填 | 待填 |

## 板书分区

- 左区：待填
- 中区：待填
- 右区：待填

## 备用方案

- 超时：待填
- 提前讲完：待填

## 退出票

1. 待填
2. 待填
3. 待填
`
}

/**
 * Case README.
 * @param {object} input - scaffold input.
 * @returns {string} Markdown text.
 */
export function caseReadme(input) {
  return `# ${input.title}

这是一个教学物料制作案例目录，由 DeepSeek Harness 的 \`dsh-teaching-material-workbench\` 插件生成。

## 顺序

1. 填 \`profile.yml\` 与 \`lesson.yml\`：确认学段、场景、时长、评估方式、权威文件。
2. 填 \`sources.csv\`：每条写清发布方、日期、定位、获取方式、许可、核验状态。二手材料只能用来定位一手，不能当依据。
3. 填 \`alignment.csv\`、\`rubric.csv\`、\`timeline.csv\`、\`glossary.csv\`、\`misconceptions.csv\`。
4. 用你选择的工具生成 \`build/deck.pptx\` 与 \`build/handout.docx\`（或同类产物），再写 \`teacher-pack.md\`。
5. 运行门禁：\`teaching_material_gate\`；未通过就改数据，不要改判据。
6. 版权审计：\`teaching_material_audit\`。
7. 记录产物哈希：\`teaching_material_repro\`。
8. 人工验证：把 \`verification/peer-review.template.md\` 复制为 \`verification/peer-review.md\` 并填写；有真实学生数据时放 \`verification/pilot.csv\`。做不到就保留“未执行”，不要写通过。

## 规则

- 工作台核心与学科无关；学科内容只在本目录。
- 没取得原文的材料写“未验证”，不要用二手顶替。
- 受版权保护的内容不入库，只记页码与转述。
`
}

export const PEER_REVIEW_TEMPLATE = `# 同行评审记录（未执行则保留模板，不要写通过）

- reviewer（姓名/角色）：
- date（YYYY-MM-DD）：
- design（单盲/双盲/无）：
- blind（评审人是否知道作者）：
- 评审框架：QM Higher Education Rubric 或 OSCQR（二选一，写明条目）

## 意见（至少 3 条）

1. 意见：
   - 依据：
   - 处置：接受 / 不接受（理由）
2. 意见：
   - 依据：
   - 处置：
3. 意见：
   - 依据：
   - 处置：
`

export const PILOT_TEMPLATE = `id,item,metric,value,n,design,note
P01,前测平均分,mean,,,single-blind,
P02,后测平均分,mean,,,single-blind,
P03,题目难度,facility,,,single-blind,
P04,题目区分度,discrimination,,,single-blind,
`

export const GROUNDING_RULES = `# 接地铁律

- 每条要教给学生的实质结论，都必须在 claims.csv 有对应行：claim、source_id、locator、status。
- status 只有 supported / partial / unsupported 三种。unsupported 必须改材料，不能留。
- teacher-pack.md 引用来源时写 [S01] 这样的标记，方便核对。
- 知识库只登记来源与定位，不复制受版权保护的原文。
`

export const TRIAL_DESIGN_TEMPLATE = `# 试点设计（有 pilot.csv 数据时必须填写）

- 研究问题：
- 分组：单组前后测 / 对照组 / 无对照
- 盲法：单盲 / 双盲 / 无
- 评分者（几人、是否独立）：
- 样本量依据：
- 主要指标：前后测分数 / 题目难度 / 区分度（选一个为主）
- 分析计划：

> 有设计无数据记“未执行”；有数据无设计记失败。
`
