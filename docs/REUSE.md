# 复用清单（REUSE）

对象：`dsh-teaching-material-workbench` 0.2.2。本文件记录本插件对已有工具、规范与经验的复用、借鉴与不采用，含来源、复用内容、原因、许可与兼容风险、我方改动。合规判定见同目录 `COMPLIANCE-REVIEW.md`。

## 0. 复核快照与口径

- 工作区包：`plugins/dsh-teaching-material-workbench`，`package.json` 版本 0.2.2（mtime 2026-11-07 14:49:17），`lib/outline.js` 4,362 B（14:47:37），`tests/core.test.js` 14,454 B（14:49:17），21 项测试通过。
- 打包物：`dsh-teaching-material-workbench-0.2.2.tgz`（14:49:37，51,234 B，SHA-256 前缀 `DA9F0D78CDDE4684`）。
- 已安装：profile `desktop` 的 `node_modules/dsh-teaching-material-workbench` 为 0.2.2；profile `package.json:13` 的依赖为 `file:...dsh-teaching-material-workbench-0.2.2.tgz`，bundles 列表第 23 行含本包。
- 复核期间包从 0.2.0 升到 0.2.2（0.2.0 → 0.2.1 → 0.2.2 的变化见 `CHANGELOG.md:3-22`）。本清单按 0.2.2 记录；0.2.0 时已核对的官方规范、社区插件、Python 仓库与外部标准结论，在 0.2.2 上仍成立（下文逐项标注新增部分）。
- 判定口径：**复用**＝直接沿用结构或格式；**借鉴**＝做法一致但代码重写；**未采用**＝评估后不用，写明原因。

复核后状态：本清单完成时（约 15:20）工作区源码已升到 0.2.3（`package.json` 版本 0.2.3，mtime 14:54:02，SHA-256 前缀 `36EA6DB43435C76A`；`lib/index.js` 前缀 `48D0780B676A280E`，`lib/gate.js` 前缀 `6CA3BE27C4469FC1`），`CHANGELOG.md` 已有 0.2.3 条目（修头注释、`tests/` 入包、加端到端测试、更新 `docs/COMPLIANCE.md`），但 tgz 与已安装副本仍是 0.2.2，未见 0.2.3 的打包物。本清单的行号与哈希按第 0 节的 0.2.2 快照；0.2.3 的复用结论未逐项重跑，发布前需按其差异复核 `COMPLIANCE-REVIEW.md` 的 C15、C16、C17、C19、C20。

## 1. DSH 官方 Host bundle 规范

来源：`D:\团聚体\桌面\deepseek harness\resources\app.asar\dsh\node_modules\@deepseek-ai\dsh-agent-preset\skills\cordis-plugin-development\references\host-plugin.md`（83 行，下称 `host-plugin.md`）与同 skill 的 `SKILL.md`（50 行）。注意：profile 内 DSH 0.2.0-rc.1 附带的旧副本只有 60 行，本复核以 app.asar 内 0.2.2-rc.1 的新版为准，因为运行中的 Harness 是 0.2.2-rc.1（`app.asar/dsh/node_modules/@deepseek-ai/dsh/package.json:4`）。

复用了什么、如何核对：

| 规范条目 | 依据 | 本包实现 | 核对结果 |
|---|---|---|---|
| Host-only bundle 无需依赖、安装脚本、构建工具 | `host-plugin.md:7` | 无 `dependencies`、无 `postinstall`/`prepare`、无构建步骤，`lib/` 直接发布 ESM | 一致，见 `COMPLIANCE-REVIEW.md` C1/C2 |
| 清单声明 `dsh.bundle.patch` | `host-plugin.md:9-27` | `package.json:44-48` 指向 `./cordis.patch.yml` | 一致 |
| bundle patch 用 Loader 的 insert 语法，包名与行 id 唯一 | `host-plugin.md:20-27` | `cordis.patch.yml:4-6`：`id: teaching-material-workbench`，`name: dsh-teaching-material-workbench` | 一致 |
| 显示文本放 `locale/en.json`、`locale/zh.json` 的 `meta.title`/`meta.description` | `host-plugin.md:29-42` | `locale/en.json:1-5`、`locale/zh.json:1-5`；英文标题句首大写（`Teaching material workbench`） | 一致 |
| 原创图标或可再分发素材；导出 `./locale/*.json` 与 `./icon`；`files` 收齐补丁、locale、图标与全部运行时文件 | `host-plugin.md:34-35`、`host-plugin.md:44-51` | `package.json:7-12` 导出 locale、`./icon`、`./package.json`；`package.json:13-24` 的 `files` 覆盖 `lib/`、`skills/`、locale、icon、补丁、docs、community、README、CHANGELOG、LICENSE | 一致；`lib/outline.js` 靠 `lib/` 通配覆盖 |
| 打包或发布版要核对实际打包清单 | `host-plugin.md:35-36` | 用 `tar -tzf` 核对 0.2.2 包内容 | 已完成，发现 tests 未打包，见 C16/C17 |
| `index.js` 二选一导出：`apply(ctx, config)`（可带 `inject`、`Config`）或默认导出 service class，勿混用 | `host-plugin.md:57-64` | `lib/index.js:516-517` 导出 `name`、`inject = ['tools']`；`lib/index.js:523-541` 导出 `apply(ctx)`；无默认导出 | 一致 |
| 每个资源在 `apply` 内用 `ctx.effect`/`ctx.on` 注册并返回清理函数 | `host-plugin.md:64` | 工具注册 `lib/index.js:526`；skill 注册 `lib/index.js:529-540` | 一致；`cordis_inspect_query` 读到 `tools.register` 返回 disposer，`skills.register` 也返回 disposer |
| 不通过读写 profile 的 `cordis.patch.yml` 持久化自身配置 | `host-plugin.md:66-77` | 插件只写用户传入的案例目录（`lib/index.js:137-162`、`lib/gate.js:645` 等）；仓库内检索无 profile 路径写入 | 一致 |
| 安装走 `plugin_manager install_bundle`／`dsh plugin add`，不由插件自行改写 profile | `SKILL.md:8-10`；`host-plugin.md:79-83` | README 的安装步骤如此写（`README.md:21-31`）；本包不含安装逻辑 | 一致 |

我方改动：没有偏离规范的做法。额外增加激活期 schema 自检 `assertToolSchema`（`lib/index.js:496-514`），在注册前拒绝模型侧函数校验器会拒收的 `parameters`（典型是属性级布尔 `required`）。这是 0.1.1 的缺陷修复（`CHANGELOG.md:24-28`），规范未强制要求，作用是提前暴露错误。

## 2. 社区插件 dsh-memory-evolve

来源：`C:\Users\团聚体\.dsh\profiles\desktop\node_modules\dsh-memory-evolve`，版本 0.1.0，MIT 许可（`LICENSE` 1,069 B）。

复用与借鉴：

| 项目 | 来源证据 | 本包对应 | 类型 |
|---|---|---|---|
| 包结构：`type: module`、`main: lib/index.js`、`exports`、`dsh.bundle.patch` | `dsh-memory-evolve/package.json:5-29` | `package.json:5-12`、`:44-48` | 复用结构 |
| bundle patch 只插一行，注释明确禁止在 profile patch 里重复插入 | `dsh-memory-evolve/cordis.patch.yml:1-10` | `cordis.patch.yml:1-6` | 复用结构 |
| ToolDefinition 形态：`name`/`description`/`parameters`（对象级 `required` 数组）/`output.schema`/`output.render`/`execute` | `dsh-memory-evolve/lib/skills.js:305-429` | 本包 7 个工具的同一形态，如 `lib/index.js:349-407`（ground）、`:409-435`（outline）、`:486`（工具表） | 复用形态 |
| 资源注册放在 `ctx.effect(() => ctx.tools.register(...), label)` | `dsh-memory-evolve/lib/index.js:1720-1725` | `lib/index.js:526` | 复用写法 |
| 通过 `ctx.get('skills')` 读共享技能注册表，缺服务时不报错 | `dsh-memory-evolve/lib/skills.js:264-276` | `lib/index.js:529`（`ctx.get('skills')` 判空后才注册） | 复用写法 |
| 技能命名用 kebab-case，正文是带 `name`/`description` frontmatter 的 `SKILL.md` | `dsh-memory-evolve/lib/skills.js:38`、`:67-90` | `skills/teaching-material-workbench/SKILL.md:1-4`；名称 `teaching-material-workbench`（`lib/index.js:34`） | 复用约定 |

未复用的部分：dsh-memory-evolve 的记忆存储、Web UI 客户端、i18n 词典、`skill_manage` 的文件写入与审批队列、外部 CLI 调度。原因：本包只做教学物料门禁，不管理用户技能文件；运行时技能用 `ctx.get('skills').register()` 注册（`lib/index.js:529-540`，`source: 'bundled'`），不写 `~/.agents/skills`。`cordis_inspect_query` 的 Host `skills` 服务契约确认 `register(skill: SkillRegistration): () => void` 存在，且 `SkillSource` 允许 `bundled`，本包用法与契约一致。

许可与兼容风险：两者都是 MIT，本包未复制其代码，只沿用通用结构与注册写法，无许可冲突。兼容风险在于上下游 API 变化（`ctx.tools.register`、`skills.register` 的签名）；当前 0.2.2-rc.1 下签名与用法一致。

## 3. 已有的 Python 工作台 teaching-material-workflow

来源：`D:\团聚体\桌面\英语教学\teaching-material-workflow`。许可为分段许可：代码 MIT，文档 CC BY 4.0（`LICENSE:1-5` 原文）。本清单对文档结构与规则的沿用已在此署名：SUNY、W3C 等标准本身另有许可，工作台仓库作者为 Li Tianxing。

### 3.1 门禁分层与三态判定

- 复用：`docs/contracts.md:8-14` 规定状态只有 `pass`/`fail`/`skip`，每条门禁必须声明层级 `E1`（自洽）、`E2`（外部标准）、`E3`（外部实证）与 `basis`（具体标准号+条款、官方文件+页码或“项目约定（E1）”），报告表头为 `门禁 | 层级 | 依据 | 结果 | 说明`，`skip` 不得写成通过。本包 `lib/gate.js:41-50` 的 `ok`/`fail`/`skip` 返回同一组字段；`lib/gate.js:639` 的报告表头与 `contracts.md:14` 逐字一致；`SKILL.md:31-37` 对三层的读法沿用其框架。
- 复用：门禁编号与判据映射。`docs/contracts.md:140-153` 列出 `E1-schema`、`E1-timeline`、`E1-alignment`、`E1-rubric-sum`、`E1-consistency`、`E2-sources`、`E2-rubric-source`、`E2-accessibility`、`E2-language`、`E2-rights`、`E3-human`、`E3-pilot`。本包 `lib/gate.js:582-591` 的 `CHECKS` 保留这些编号，另加 `E1-build`（产物存在）、`E2-grounding`（结论接地，`lib/gate.js:482-499`）、`E2-knowledge`（概念定位，`lib/gate.js:407-426`）。
- 借鉴：`tools/gate.py:36-44` 让“检查器抛异常”记 fail，本包 `lib/gate.js:605-611` 同样处理（`检查器异常按失败处理`）；`tools/gate.py:76` 的“未执行不等于通过”提示被 `lib/gate.js:637` 沿用；汇总文案（`tools/gate.py:68`）对应 `lib/gate.js:645`。
- 未复用：`E2-render`（LibreOffice 渲染核对）与 `E1-competitors`（同类产品清单）。原因：本包不解析、不渲染 pptx/docx，渲染核对交由 DSH 的 office 技能（见第 5 节）；同类产品调研在设计与复核阶段做，不放进每个案例目录。

### 3.2 数据格式与列契约

- 复用：`templates/README.md:13-29` 的样例文件列契约。本包 `lib/templates.js:3-12` 的 `CSV_HEADERS` 与其对应：`alignment.csv`、`timeline.csv`、`glossary.csv` 列名一致；`misconceptions.csv` 把 `source` 改为 `source_id`；`rubric.csv` 增加 `source_id`、`status`；`sources.csv` 增加 `license`、`verified`、`role`、`notes`。新增 `claims.csv`、`knowledge.csv` 为本包为接地检查补的登记表。
- 复用：情境档案字段。`docs/contracts.md:31-54` 的 `profile` 结构（`id`、`title`、`subject`、`level`、`audience`、`setting`、`language`、`duration_min`、`delivery`、`assessment_regime`、`authorities`、`constraints`、`thresholds`、`outputs`）被 `lib/templates.js:46-71` 的 `profileYaml` 沿用，阈值保留 `body_min_pt` 等四项。
- 复用：报告落盘习惯。`tools/gate.py:85` 写 `<lesson>/gate-report.md`，本包 `lib/gate.js:629-651` 写 `<case>/gate-report.md`；本包另写 `verification/grounding-report.md`（`lib/gate.js:506-524`）与 `verification/rights-report.md`、`verification/repro.json`。

### 3.3 中文排版规则

- 复用：`tools/lint_cjk.py:24-52` 的规则集被改写为 `lib/gate.js:327-334` 的 `LANGUAGE_RULES`。对应关系：`CJK-LATIN-NOSPACE`/`LATIN-CJK-NOSPACE` → 中英两侧缺空格；`ASCII-COMMA`/`ASCII-AFTER-PUNCT` → 中文后接或半角标点后接中文；`DASH-SPACED` → 破折号前后有空格；`CORNER-BRACKET` → 直角引号（U+300C、U+300D）。另按本工作区的语言规范加了“AI 腔套话”规则，词表见 `lib/gate.js:334`，不在文档里复述。
- 未移植：`ASCII-PERIOD`、`ASCII-QUOTE`（中文直引号）、`NUM-UNIT-NOSPACE`（数字与单位）。原因与本包输入形态有关：门禁对象是 `teacher-pack.md`、`lesson.yml` 与 CSV 文本，不是 pptx/docx 段落；另外三条规则在本包数据上召回低，留作后续补齐项（见第 9 节）。`lint_cjk.py` 用 python-pptx/python-docx 遍历幻灯片与表格的写法没有复用，因为 Host 插件保持零运行时依赖（`README.md:33`）。

### 3.4 为什么没有直接复用 Python 实现

1. DSH Host 插件必须是 JS ESM，Python 代码不能直接挂在 `ctx.tools` 上。
2. 零依赖约束：为跑一个语言检查而引入 Python 运行时与 python-pptx 不划算，也增加安装风险。
3. 检查对象不同：Python 工作台检查二进制产物（pptx/docx），本包检查案例数据文件与教师包文本；二进制核对改由 office 技能承担。
4. 测试与 CI 形态不同：本包用 `node --test`（`tests/core.test.js`），与 npm 打包、`engines.dsh` 一起发布。

## 4. 知识库接地与检索增强式 AI 助教的对应关系

来源：`D:\团聚体\桌面\英语教学\我的学习\教学物料制作工作台\01-四个问题的答案.md:44-45` 记录了两类参照：清华 THU-MAIC 的 OpenMAIC 做“课程生成＋互动课堂”，清华课程级 AI 助教由教师提供教材、习题、论文建知识库，媒体报道某课程答题正确率从 80% 升到 95%。`04-证据登记表.md:21` 把后者记为 E12“已核验（媒体陈述，非独立评估）”，`:58` 明确说明这类效果数据不能当效果证据。

对应关系：

- 检索增强式助教的基本契约是“结论 → 来源 → 定位”可追溯。本包把这条契约从对话搬到材料生产：`claims.csv` 一行一条结论（`templates.js:5`），`knowledge.csv` 一行一个关键概念（`templates.js:6`），教师包用 `[Sxx]` 标记引用，`teaching_material_ground` 检查行完整性、来源存在与否、定位粗细（`lib/gate.js:441-499`），`E2-knowledge` 检查概念是否都落到来源与定位（`lib/gate.js:407-426`），`E2-grounding` 在门禁里复检（`lib/gate.js:482-499`）。`lib/gate.js:4-8` 与 `GROUNDING_RULES`（`templates.js:200-206`）写明这是“把知识库契约做成检查，而不是聊天回答”。
- 差异：本包不做检索服务、不建向量库、不调 LLM，也不声称能提升学习成绩。理由是材料生产要可审计、可复现、可离线（`README.md:70`）；效果证据属 E3，没有真实试点就记 `skip`（`lib/gate.js:562-579`），与工作台证据登记表对“媒体自述不能当效果证据”的判断一致。
- 与清华经验的边界：清华做的是课堂问答侧的知识库，本包做的是材料生产前的接地检查；共同点只有来源与定位可追溯，交付物不同。

新增（0.2.1 起）：`knowledge.csv` 是可选表，缺省时 `E2-knowledge` 记 `skip` 而非 fail（`lib/gate.js:409-411`），这样旧案例不受影响；`outline.md` 会单列“知识库定位”一节（`lib/outline.js:88-94`）。

## 5. 大纲生成与现有 pptx/office 技能的分工

本包的 `teaching_material_outline` 只生成结构化 Markdown 大纲，不做排版与渲染：`lib/outline.js:1-8` 写明“这不是渲染器”，输出 `build/outline.md`（`lib/outline.js:36-108`），内容来自 `lesson.yml`、`timeline.csv`、`rubric.csv`、`glossary.csv`、`sources.csv`、`knowledge.csv` 与 `profile.yml`。SKILL 的流程第 7 步也写明“再用你选择的课件工具排版”（`SKILL.md:25`）。

分工建议（按案例制作阶段）：

| 阶段 | 工具 | 输出 | 依赖 |
|---|---|---|---|
| 结构 | 本包 `teaching_material_outline` | `build/outline.md` | 无，Node 内置模块 |
| 排版 | `office-pptx` / `office-docx`（DSH 内置技能） | `build/deck.pptx`、`build/handout.docx` | DSH 自带 Python（含 python-pptx/python-docx），无需另装 |
| 视觉核对 | `office-render` | 页面图片 | 随包 LibreOffice Kit（`@deepseek-ai/dsh-skill-office/package.json:44` 声明 `libreoffice-kit`） |
| 导出 | `office-export-pdf` | PDF | 同上 |
| 模板化编辑/读取旧稿 | `pptx`、`docx` 用户技能 | 改好的 pptx/docx | `pptx` 需 `markitdown`、`pptxgenjs`；`docx` 需 `docx` npm 包、pandoc、LibreOffice（`pptx/SKILL.md:11-15`、`pptx/pptxgenjs.md:5-17`、`docx/SKILL.md:15-58`） |
| 可及 PDF | `accessible-pdf` 技能 | 带标签 PDF | TeX Live 2025+、LuaLaTeX、latexmk、poppler（`accessible-pdf/SKILL.md:18-27`），只适用于 LaTeX 源 |

边界与风险：本包门禁不判断渲染、字号、溢出（`README.md:68`），这些要由 `office-render` 或 Office 可访问性检查器做，结论只能算外部工具判据，不能写成 E1 自洽通过。当前分工是人工串联：先跑大纲，再让 agent 选择 office 技能排版；没有自动调用链，属于流程待办（第 9 节）。

## 6. 外部标准（standards.js）

本包 `lib/standards.js` 登记 14 条外部依据，状态定义在文件头（`lib/standards.js:1-8`）：`verified` 表示引用的页面或摘要已读过，`partial` 表示只拿到摘要或元数据，`not-obtained` 表示正文未取得、不得当确认条款引用。当前分布：`verified` 11 条、`partial` 1 条、`not-obtained` 2 条（`node` 导入统计）。

| 条目 | 状态 | 插件记载 | 本地证据 | 本轮复核 |
|---|---|---|---|---|
| WCAG22 | verified | `2024-12-12`，SC 1.1.1、1.4.1、1.4.3、1.4.4、3.1.5 | 证据登记表 E07 | 2026-11-07 取 `https://www.w3.org/TR/WCAG22/`，页面标注 “W3C Recommendation 12 December 2024”，与插件日期一致；所引 SC 均在目录中 |
| UDL3 | verified | `2024-07-30`，3 条原则、9 条指南 | 证据登记表 E06 | 沿用 E06，本轮未重新抓取（未核验） |
| QM-HE | verified | 第 7 版，8 条通用标准、44 条具体标准、认证需 85% | 证据登记表 E04 | 沿用 E04（未核验） |
| OSCQR | verified | 50 条标准、CC BY 4.0 | 证据登记表 E05 | 2026-11-07 取 `https://oscqr.suny.edu/`，站点列出 Standards 1–50 并声明 CC BY 4.0，与插件一致；插件 `date: '2026'` 是页面访问年，不是发布年，属口径偏差 |
| ISO-24495-1 | partial | 只引摘要 | 证据登记表 E08“摘要已核验，正文未购” | 一致，状态诚实 |
| GB/T 15834—2011 | verified | 只登记标准页现行，未引条款正文 | 证据登记表 E09“标准页已核验；正文条款尚未逐条取证” | 与插件定义“页面已读即 verified”一致；对外若说“条款级核验”会夸大，措辞要小心 |
| GB/T 15835—2011 | not-obtained | 正文尚未逐条取证 | 未见条款级证据 | 一致，状态诚实 |
| PDF/UA（ISO 14289-1） | not-obtained | Matterhorn Protocol 正文未取得 | 证据登记表 E52“抓取返回 403” | 一致，状态诚实 |
| Tomlinson-2012 | verified | DOI 10.1017/S0261444811000528 | 证据登记表 E01 Crossref 已核验 | 一致（本轮未重跑 Crossref） |
| Nation-2006 | verified | DOI 10.3138/cmlr.63.1.59 | 证据登记表 E02 Crossref 已核验 | 一致（本轮未重跑） |
| Haladyna-2002 | verified | DOI 10.1207/S15324818AME1503_5 | 证据登记表 E03 Crossref 已核验 | 一致（本轮未重跑） |
| Mayer-2009 | verified | DOI 10.1017/CBO9780511811678 | 仓库 `docs/_generated/dois.md:8` Crossref OK | 一致 |
| Merrill-2002 | verified | DOI 10.1007/BF02505024 | `docs/_generated/dois.md:9` Crossref OK | 一致 |
| Cohen-1960 | verified | DOI 10.1177/001316446002000104 | `docs/_generated/dois.md:12` Crossref OK | 一致 |

结论：14 条状态与本地证据登记表一致，没有把 `not-obtained` 写成 `verified`；需要对外说明的口径有两处：GB/T 15834 是标准页核验而非条款级核验，OSCQR 的 `2026` 是访问年份。三篇 DOI（Tomlinson、Nation、Haladyna）的证据在项目仓库的证据登记表里，不在插件包内，复核时要回看仓库。

## 7. 现有 DSH skills 的可用性

| 技能 | 在案例制作中的用途 | 额外依赖 | 许可/注意 |
|---|---|---|---|
| `office`（路由） | 选择 office-docx、office-pptx、office-render、office-export-pdf | 无 | DSH 内置 |
| `office-pptx` | 生成/修改 `build/deck.pptx` | 用 `load_workspace_dependencies` 的 Python（含 python-pptx），不装 npm/pip | DSH 内置，MIT 生态 |
| `office-docx` | 生成/修改 `build/handout.docx` | 同上（python-docx） | 同上 |
| `office-render` | 渲染页面做视觉核对 | 随包 LibreOffice Kit | 同上 |
| `office-export-pdf` | 导出 PDF | 随包 LibreOffice Kit | 同上 |
| `pptx`（用户技能） | 读旧稿、模板化编辑、缩略图 | `markitdown`、`pptxgenjs`；`scripts/thumbnail.py` | `LICENSE.txt` 为 Proprietary，只可调用，不复制文件进包 |
| `docx`（用户技能） | 读旧稿、模板化编辑、接受修订 | `docx` npm 包、pandoc、LibreOffice | 同上 |
| `accessible-pdf` | 由 LaTeX 生成 PDF/UA-1、PDF/A-2b 标签 PDF | TeX Live 2025+、LuaLaTeX、latexmk、poppler | 只适用于 LaTeX 源；Windows 下用 `latexmk -lualatex`，`make` 不可用 |
| `pdf` | 通用 PDF 读取、合并、OCR | 视任务而定 | 与本包数据门禁无直接关系 |

结论：案例制作的推荐路线是零额外依赖的 `office-pptx`/`office-docx`/`office-render`；只有在需要模板化编辑或 LaTeX 可及 PDF 时才加载 `pptx`/`docx`/`accessible-pdf`，并接受其外部依赖。

## 8. 不采用清单

| 对象 | 不采用原因 | 证据/备注 |
|---|---|---|
| OpenMAIC 代码 | 许可状态不一致：仓库 `LICENSE` 与 GitHub API 为 MIT，官网写 AGPL-3.0；根 MIT 不覆盖子包 `packages/mathml2omml`（LGPL-3.0-or-later）。复用前必须读 LICENSE 原文并确认 | `design-review/01-四个问题的答案.md:135`；`design-review/04-证据登记表.md:19-20`；插件包内 `docs/TSINGHUA-INTEGRATION.md` 是另一复核任务的产出（未逐行核验） |
| 课程生成平台、多智能体课堂、学生端助手、平台化部署 | 范围不同：本包做证据层与质量层，不做课程生成器；这些能力另有许可、技术栈与运维成本 | `01-四个问题的答案.md:44-45`、`:181`；`docs/TSINGHUA-INTEGRATION.md` 第 4 节（未逐行核验） |
| 重量级运行时依赖（Python、pptxgenjs、LibreOffice 调用、向量库） | 零依赖是本包的发布前提：无 `dependencies`、无安装脚本；渲染交给 DSH 已有技能 | `package.json:1-49`、`README.md:33` |
| 内置 LLM、检索服务、网络请求 | 材料生产要离线可复现，且外部模型调用会把案例数据送出本机；隐私与可审计性优先 | 插件源码无 `fetch`/`http`/`child_process`（检索结果为零，见 `COMPLIANCE-REVIEW.md` C10） |
| `pptx`/`docx` 技能文件 | 这两个技能的 `LICENSE.txt` 为 Proprietary，复制文件会带入再分发限制 | `pptx/SKILL.md:4`、`docx/SKILL.md:4` |
| QM、OSCQR 量表正文 | OSCQR 为 CC BY 4.0（需署名），QM 量表受版权保护；本包只登记条目名与用途，不复制量表文本 | `oscqr.suny.edu` 页面许可声明；`lib/standards.js:31-50` |
| Web UI 面板 | 本包是 Host-only bundle，用户界面是工具、运行时技能与产物文件；社区规范不要求 UI | `docs/COMPLIANCE.md:62-66` |

## 9. 复用风险与待办

1. `lint_cjk.py` 的三条规则（半角句点、直引号、数字单位）未移植，可在 `lib/gate.js:326-334` 补规则，不需新增依赖。
2. 大纲到排版的调用链是人工步骤（第 5 节）；如需自动化，可写成技能里的固定流程，但不要在插件里直接依赖 office 技能的内部命令。
3. `docs/COMPLIANCE.md` 仍是 0.1.x 的说明（mtime 14:30，早于 0.2.0—0.2.2），与新增的 ground/outline/knowledge 不同步，见 `COMPLIANCE-REVIEW.md` C18。
4. 外部标准的条款级引用仍不完整：GB/T 15834 只到标准页，PDF/UA 只有 Matterhorn 链接；写作引用时要按 `lib/standards.js:1-8` 的状态口径标注，不能升级成“已核验条款”。
5. 打包物与工作区不同步：0.2.2 的 tgz 内 `community/index.example.json` 仍是 0.1.0，`docs/TSINGHUA-INTEGRATION.md` 是较旧版本；重新打包前不要提交社区索引。

## 10. 未核验项

- 图标原创性：`docs/COMPLIANCE.md:23` 声明为本包原创，本轮无法独立核验作者身份；已核对图标在包内、SVG 可解析、531 B、无外部引用。
- `docs/TSINGHUA-INTEGRATION.md`（47,130 B，14:50:20）只读了前 22 行，未逐行核验其事实表。
- UDL3、QM-HE 的发布信息本轮未重新联网抓取，沿用项目证据登记表 E04—E06。
- Tomlinson、Nation、Haladyna 三篇 DOI 本轮未重跑 Crossref，沿用证据登记表 E01—E03。
- Python 工作台仓库的 git commit 未核验，只按当前工作树文件引用。
