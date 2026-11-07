# 插件独立验收报告：dsh-teaching-material-workbench

- 验收对象：`dsh-teaching-material-workbench` **0.2.2**（desktop profile 已安装并生效：7 个工具全部注册且可调用）
- 验收人：独立验收员 acceptance-verifier（会话 ID `efb72387-bec1-41aa-bc8d-ef8196331727`）
- 验收时间：2026-11-07 14:38–14:53（Asia/Shanghai）
- 工作目录：`D:\团聚体\桌面\英语教学\我的学习`
- 案例目录：`D:\团聚体\桌面\英语教学\我的学习\verification\case-acceptance`（25 个文件）
- 结论：**通过**。最终安装版 0.2.2 下 7/7 工具成功调用；门禁 12 通过 / 0 失败 / 3 未执行；新增的 E2-knowledge 为 PASS；无阻塞缺陷；5 项文档层面小问题见第十二节。

> 版本说明：任务书基线为 0.1.1（5 工具）。验收期间插件连续升级三次，本报告以**最终实际安装的 0.2.2** 为验收对象；0.2.0 阶段也跑过全套工具（gate 11/0/3），最终数值以 0.2.2 为准。

## 一、版本与安装事实

| 事实 | 证据位置 | 实际值 |
|---|---|---|
| 升级 1 | `.plugin-manager\logs\operation-NrC7dF\pnpm.log`（14:41:28） | `- 0.1.1` → `+ 0.2.0`，`Done in 6.2s` |
| 升级 2 | `.plugin-manager\logs\operation-NgIGAt\pnpm.log`（14:48:40） | `- 0.2.0` → `+ 0.2.1`，`Done in 3.7s` |
| 升级 3（最终） | `.plugin-manager\logs\operation-IT1pK8\pnpm.log`（14:49:51） | `- 0.2.1` → `+ 0.2.2`，`Done in 3.5s` |
| 源包版本 | `plugins\dsh-teaching-material-workbench\package.json` | `"version": "0.2.2"` |
| 已安装副本版本 | `~\.dsh\profiles\desktop\node_modules\dsh-teaching-material-workbench\package.json` | `0.2.2` |
| 安装来源 | `~\.dsh\profiles\desktop\package.json` 的 dependencies | `file:D:/团聚体/.../dsh-teaching-material-workbench-0.2.2.tgz` |
| profile 注册 | 同上 dsh.profile.bundles | 包含 `dsh-teaching-material-workbench` |
| 打包产物完整性 | `tar -xzf` 后逐文件 SHA-256 与安装副本对比 | tgz 20 个文件 **20/20 一致**（diff=0，missing=0） |
| tgz 指纹 | `Get-FileHash dsh-teaching-material-workbench-0.2.2.tgz` | `da9f0d78cdde4684f1bd2ef7c29c8fcc66fc76fad99bb430ad68c31e7f925ea6` |
| 安装副本文件数 | `Get-ChildItem -Recurse -File` | 20 个，与 tgz 清单相同 |
| 运行时工具数 | 本会话实际调用 | **7 个**：init、gate、audit、repro、ground、outline、standards |

## 二、工具实际调用记录（0.2.2 下 7/7 成功）

以下调用均发生在 0.2.2 安装完成（14:49:51）之后。

| # | 工具 | 关键参数 | 实际返回摘要 | 产物 |
|---|---|---|---|---|
| 1 | teaching_material_init | directory=`...\verification\case-acceptance\_scaffold-021`，title=脚手架回归检查：企业安全培训，subject=企业安全培训，level=成人学习者，audience=新员工，setting=企业内训，duration_min=30，id=scaffold-021-check | `ok=true`；**文件 19 个**，含 `knowledge.csv` 与 `verification/trial-design.template.md`（0.2.2 新增，核对清单后已删除该子目录） | 临时脚手架（已清理） |
| 2 | teaching_material_outline | directory=`...\verification\case-acceptance` | `ok=true`；`页数 7；时间轴 5 段` | `build/outline.md`（2941 B，含 profile 上下文与知识库定位节） |
| 3 | teaching_material_gate | directory=`...\verification\case-acceptance` | `summary={pass:12, fail:0, skip:3}`；15 项检查 | `gate-report.md` |
| 4 | teaching_material_audit | directory=`...\verification\case-acceptance` | `sources=3；primary_verified=2；secondary=1；restricted=[{S03, publisher-copyright}]；issues=[]` | `verification/rights-report.md` |
| 5 | teaching_material_ground | directory=`...\verification\case-acceptance` | `claims=3；supported=2；partial=1；unsupported=0；coverage=0.667；cited_markers=5；issues=[]` | `verification/grounding-report.md` |
| 6 | teaching_material_repro | directory=`...\verification\case-acceptance` | `ok=true；artifacts=4` | `verification/repro.json` |
| 7 | teaching_material_standards | 无参数 | `count=14`（verified 11 / partial 1 / not-obtained 2） | 无（纯返回） |

历史记录：主案例由 0.2.0 的 init 创建（17 个文件，含 claims.csv）；0.2.1/0.2.2 新增的数据文件（knowledge.csv）按现行契约手工补齐，0.2.2 的 init 新增文件另用上述子目录核对。验收开始时首次 init 曾落在重装窗口返回 `Error: unknown tool "teaching_material_init"`，重装完成后重试成功（环境事件 E1，见第十二节）。

## 三、案例数据（最小但真实，非 IB）

- 学科：成人职场写作；场景：企业内训工作坊；学习者：企业新员工；时长 60 分钟；评估：形成性，20 分。
- 学习目标 3 条（O1 改写句、O2 主题行、O3 整段改写）；对齐矩阵 3 行全覆盖。
- `sources.csv` 3 条，核验方式与定位：

| id | 类型 | 核验 | 许可 | 定位与核验方式 |
|---|---|---|---|---|
| S01 | primary | yes | public-domain | `https://digital.gov/guides/plain-language/principles/` 与 `.../guides/plain-language/`。`Invoke-WebRequest` 抓取原始 HTML，确认页面标题 `Principles of plain language | Digital.gov`、总览段与 `writing for your audience` 表述；页面未标注发布日期（date 字段如实写“未标注”）。 |
| S02 | primary | yes | public-domain | Project Gutenberg eBook #37134《The Elements of Style》。抓取 HTML 后在正文定位 `III. ELEMENTARY PRINCIPLES OF COMPOSITION` 与 `13. Omit needless words`；另核对 PG 元数据 `Copyright: Public domain in the USA`。 |
| S03 | secondary | partial | publisher-copyright | DOI `10.1017/S0261444811000528`。Crossref API 核验标题、作者 Tomlinson、期刊 Language Teaching 45(2)、页码 143–179、2012 年；正文需订阅，未取得。 |

- `claims.csv` 3 条（supported 2 / partial 1），teacher-pack.md 含 5 处 `[Sxx]` 标记。
- `knowledge.csv` 4 条概念映射（0.2.1 起的数据文件）：

| concept | source_id | locator |
|---|---|---|
| plain language | S01 | `https://digital.gov/guides/plain-language/principles/` Overview 小节 |
| hidden verb | S01 | 同页 Words matter 小节 |
| omitting needless words | S02 | 第三章 Rule 13 Omit needless words |
| active voice 与被动语态 | S01 | 同页 Follow plain language guidelines 小节 |

- `rubric.csv` 4 项合计 20 分；`timeline.csv` 5 段合计 60 分钟；`glossary.csv` 5 个术语全部出现在 teacher-pack.md；`misconceptions.csv` 2 条；`figures.json` 为空（任务允许）；`palette.json` 默认 4 组配色。
- `build/` 产物：`deck.pptx`（196 B 占位文本）、`handout.docx`（178 B 占位文本）、`outline.md`（2941 B，由 outline 工具生成）。
- 案例目录 25 个文件：8 个 CSV（含 knowledge.csv）、2 个 YAML、2 个 JSON、README、teacher-pack、gate-report、build 3 件、assets/.gitkeep、verification 5 件（peer-review.template.md、pilot.template.csv、rights-report.md、grounding-report.md、repro.json）。

## 四、门禁实际输出（0.2.2，15 项，原文）

```
门禁：通过 12 / 不通过 0 / 未执行 3
PASS E1-schema [E1] 全部数据文件可解析，必填字段齐全
PASS E1-timeline [E1] 共 5 段，合计 60 分钟
PASS E1-alignment [E1] 3 行；3 个目标全部有对应活动
PASS E1-rubric-sum [E1] 4 条合计 20 分
PASS E1-consistency [E1] 跨文件引用全部可解析
PASS E2-sources [E2] 3 条来源，已核验一手 2 条
PASS E2-knowledge [E2] 4 个概念都有来源与定位
SKIP E2-rubric-source [E2] 没有 official 行：官方 mark scheme 未取得或未录入，评分标准只能视为教材/自拟，未完成官方对照
PASS E2-grounding [E2] 3 条结论：supported 2，partial 1；teacher-pack 引用标记 5 处
PASS E2-accessibility [E2] 4 组配色达标；图有替代文本；阈值齐全
PASS E2-language [E2] 中英间距、全角标点、破折号与套话检查 0 违例
PASS E2-rights [E2] 3 条来源许可已登记；案例目录无原始材料文件
PASS E1-build [E1] 产物：deck.pptx、handout.docx、outline.md
SKIP E3-human [E3] 未执行：没有 verification/peer-review.md
SKIP E3-pilot [E3] 未执行：没有 verification/pilot.csv
报告：D:\团聚体\桌面\英语教学\我的学习\verification\case-acceptance\gate-report.md
```

`gate-report.md` 生成时间 2026-11-07 06:50:51 UTC，文件内含同一 15 行门禁表、合计行与单列“未执行”。

**未执行项单列（不得视为通过）：**

| 门禁 | 原因 | 后果 |
|---|---|---|
| E2-rubric-source | rubric.csv 没有 official 行，官方 mark scheme 未取得 | 评分标准只能视为自拟，官方逐点对照未完成 |
| E3-human | 无 `verification/peer-review.md` | 无独立同行评审记录 |
| E3-pilot | 无 `verification/pilot.csv`，也无 `verification/trial-design.md` | 无真实学习者数据；按 0.2.2 规则记未执行 |

## 五、0.2.1 / 0.2.2 新增能力的实际结果

| 变更项（Lead 要求纳入） | 实际结果 | 证据 |
|---|---|---|
| 1. 可选 `knowledge.csv` + `E2-knowledge` 门禁 | 本案例补 4 条概念映射后 **PASS**：`E2-knowledge [E2] 4 个概念都有来源与定位`。门禁实现：`concept/source_id/locator` 必填、来源必须存在、locator 不得过粗；缺文件或空表时记 skip（代码含 `未提供 knowledge.csv 数据行（未执行）` 分支）。 | 第四节门禁原文；`lib/gate.js` 的 `checkKnowledge`；单元测试 `an invalid knowledge map fails E2-knowledge` |
| 2. grounding 的“locator 过粗”判定 | 规则存在：`COARSE_LOCATOR = /^(?:p\.?|pp\.?|页|全书|网络|见教材|待补|-|—)$/iu`，claims 与 knowledge 的 locator 命中即记问题。本案例 3 条 claims 与 4 条 knowledge 的 locator 均为 URL + 小节或“第三章 Rule 13”，**未触发**，E2-grounding 与 E2-knowledge 均 PASS。失败分支由单元测试覆盖：`a coarse locator fails the grounding audit`。 | `lib/gate.js` 正则与 `analyzeGrounding`；测试 21 项中的该项；第四节门禁结果 |
| 3. E3-pilot 强化 | 本案例无 `pilot.csv` 且无 `trial-design.md`，按规则记 **skip**（未执行），未误判为通过。三条分支由测试覆盖：`an unfilled pilot template fails E3-pilot instead of passing`、`pilot data without a trial design fails E3-pilot`、`pilot data with a trial design passes E3-pilot`。代码要求 `trial-design.md` 至少含“研究问题/盲法/样本量/主要指标”中 3 个标记。 | `lib/gate.js` 的 `checkPilot`；测试输出；第四节 skip 行 |
| 4. init 新增文件 | 0.2.2 的 init 返回 **19 个文件**：在 0.2.0 的 17 个之外新增 `knowledge.csv` 与 `verification/trial-design.template.md`。 | 第二节第 1 行工具实际返回 |
| 5. sources.role 扩展 | 角色枚举为 `syllabus/markscheme/examiner-report/textbook/brief/standard/guidance/research/exercise/slides/case/lecture/other`，新增 4 类；`sources.csv` 表头仍为 `id,title,publisher,date,type,locator,access,license,verified,role,notes` 未变，旧案例兼容。 | 安装副本 `lib/gate.js` 的 `ENUMS.role`；`lib/templates.js` 的 `CSV_HEADERS.sources` |
| 6. 单元测试 21 项 | 源包目录 `node --test`（Node v25.5.0）：`tests 21 / pass 21 / fail 0`。 | 第十节测试输出清单 |

## 六、审计、接地、哈希实际输出

**audit（原文）：**

```
来源 3 条；已核验一手 2 条；二手 1 条。
受限来源：S03(publisher-copyright)
未发现问题。
报告：D:\团聚体\桌面\英语教学\我的学习\verification\case-acceptance\verification\rights-report.md
```

**ground（原文）：**

```
结论 3 条：supported 2，partial 1，unsupported 0；覆盖率 66.7%。
teacher-pack 引用标记 5 处。
没有未接地的结论。
报告：D:\团聚体\桌面\英语教学\我的学习\verification\case-acceptance\verification\grounding-report.md
```

**repro（原文）：**

```
e3b0c44298fc1c14… build/.gitkeep (0 B)
a134212bb6523d67… build/deck.pptx (196 B)
aa43694def17abf1… build/handout.docx (178 B)
30a6cafec410e523… build/outline.md (2941 B)
清单：D:\团聚体\桌面\英语教学\我的学习\verification\case-acceptance\verification\repro.json
```

**独立复算 SHA-256（`Get-FileHash -Algorithm SHA256` 对 `repro.json` 逐项比对）：**

| 产物 | 字节 | repro.json 记录（完整） | 复算结果 |
|---|---|---|---|
| build/.gitkeep | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | MATCH |
| build/deck.pptx | 196 | `a134212bb6523d67b2b8dacdbadc4cedb70c64ca824fd920d456c99dc194f9d6` | MATCH |
| build/handout.docx | 178 | `aa43694def17abf1891f9bf4c81120c64a80caf2b0b080412c5fc1dd9a91b7af` | MATCH |
| build/outline.md | 2941 | `30a6cafec410e52392826f3252a6cac7e782139359b6b0b46a5565c5908f8ce0` | MATCH |

## 七、外部依据登记表

`teaching_material_standards` 返回 14 条：verified 11 条（WCAG22、UDL3、QM-HE、OSCQR、GB-T-15834、Tomlinson-2012、Nation-2006、Haladyna-2002、Mayer-2009、Merrill-2002、Cohen-1960），partial 1 条（ISO-24495-1），not-obtained 2 条（GB-T-15835、PDF-UA）。与登记表设计一致：未取得正文的条目不标 verified。

## 八、skill 可见性

- 本会话技能目录列出 `teaching-material-workbench`，描述含 `claim-level grounding`、`knowledge map`、`deterministic outline`。
- 用 skill 工具按名读取成功，返回 0.2.x 版 SKILL.md（含 knowledge.csv 与 ground/outline 步骤）。
- 已安装副本 `skills\teaching-material-workbench\SKILL.md` 为 4961 B，SHA-256 `efaa347edcbec22a35af30e765ff22dedf94b21ec3af9e32f38731c65d0b13b8`；运行时注册描述与文件 frontmatter 一致。

## 九、清单一致性（0.2.2 安装副本）

| 检查项 | 实际值 | 结论 |
|---|---|---|
| name/version | `dsh-teaching-material-workbench` / `0.2.2` | 与安装日志、tgz 一致 |
| engines | `dsh: >=0.2.2-rc.1`，`node: >=20` | 字段存在 |
| dsh.bundle.patch | `./cordis.patch.yml`，文件存在 | 一致 |
| exports | `.`→lib/index.js、`./locale/*.json`（2 个 json）、`./icon`、`./package.json` 全部可解析 | 全部存在 |
| files | lib/、skills/、locale/*.json、icon.svg、cordis.patch.yml、community/、docs/、README.md、CHANGELOG.md、LICENSE 全部存在 | 一致 |
| cordis.patch.yml | `insert: id: teaching-material-workbench`，`name: 'dsh-teaching-material-workbench'` | 与包名一致 |
| locale/en.json | `title=Teaching material workbench`；description 非空 | 字段齐全 |
| locale/zh.json | `title=教学物料制作工作台`；description 非空 | 与 en 结构一致 |
| icon.svg | 以 `<svg` 开头，128×128，含 `aria-label` | 有效 SVG |
| skill 文件 | `skills\teaching-material-workbench\SKILL.md`（4961 B） | 存在 |
| tgz vs 安装副本 | 20/20 一致 | 安装副本即打包产物 |
| 关键文件 SHA-256（安装副本） | package.json `35503f1733a6f97cbe13cb385f2d6280ca0af0b49733460dbdfe2b4936b131ba`；cordis.patch.yml `d1e5af88697196a1f3fec4750635314c327abb8a75c2384e831d17d82483a87f`；icon.svg `a0b69cce56e6b3e0323dc2d388c1eb689075b3946f0527c2ef5f7cc9dcd564b7`；locale/en.json `f1b4f18580b0c73fb3068a7b13574257932b82c6a28f09a2334dc9aefcf5247f`；locale/zh.json `a1dfabbbd291d0e12e108ae88d16630bc74c320db1750202523a3044837b41c9`；SKILL.md `efaa347e…`；lib/index.js `08db9f8c…`；lib/gate.js `bdf902f0…` | 可复核 |

## 十、补充独立验证

1. **已安装副本 schema 校验**（导入实际运行时 `lib/index.js`）：`toolCount=7`；7 行 `SCHEMA-OK`（init required 6 项；gate/audit/repro/ground/outline 均为 `["directory"]`；standards 为 `[]`）；`GUARD-OK: broken: $.properties.directory.required must not exist inside a property schema`。0.1.1 的属性级 `required: true` 缺陷不可复现。
2. **单元测试**（源包目录 `node --test`）：`tests 21 / pass 21 / fail 0`，逐项名称含：完整案例门禁、rubric 合计失败、official 无 markscheme、版权文件、低对比度、语言违例、unsupported 接地、缺 claims.csv 记未执行、大纲生成、**coarse locator 失败接地**、**invalid knowledge map 失败 E2-knowledge**、**空模板 pilot 失败**、**有数据无试点设计失败**、**有设计有数据通过**、bundle 清单字段、7 工具 schema 有效。
3. **0.2.0 阶段补充记录**：曾对 Lead 冒烟目录 `verification\lead-smoke` 以 `write_report=false` 只读复跑（得到 11 通过 / 0 失败 / 3 未执行，调用后该目录 `gate-report.md` 的 LastWriteTime 未变），用于交叉核对，不引用其结论；最终判断以本案例 0.2.2 结果为准。

## 十一、未执行 / 失败项

| 项 | 状态 | 原因 | 交付含义 |
|---|---|---|---|
| E2-rubric-source | 未执行（skip） | 官方 mark scheme 未取得 | 评分标准未完成官方逐点对照 |
| E3-human | 未执行（skip） | 无同行评审记录 | 不视为通过 |
| E3-pilot | 未执行（skip） | 无 pilot.csv 数据，也无 trial-design.md | 不视为通过；按新规则不会误判 |
| deck/handout 排版与渲染 | 未验证 | 两文件为占位文本（任务允许） | E1-build 只证明产物存在，不证明排版、字号、溢出 |
| 工具调用失败 | 1 次（环境事件 E1） | 首次 init 落在重装窗口，返回 unknown tool；重试成功 | 不计插件缺陷 |

无门禁 fail；audit、ground、repro、outline、standards 均无报错。

## 十二、缺陷与观察

**阻塞缺陷：无。**

**历史缺陷回归：** 0.1.1 的“属性级 required:true”未复现（第十节第 1、2 项）；本次全部工具调用未出现 `Invalid schema`。

**低风险观察（非阻塞，未改代码）：**

| 编号 | 类型 | 证据 | 说明 |
|---|---|---|---|
| D1 | 注释滞后 | 安装副本 `lib\index.js:4` | 注释仍写 `Registers five tools and one runtime skill`，实际 7 个工具 |
| D2 | 社区索引示例版本滞后 | 已发布 `community\index.example.json:39` | `versions[0].version` 仍为 `0.1.0`（源码工作树已改为 0.2.2，但 0.2.2 tgz 未包含该改动） |
| D3 | 文案滞后 | 安装副本 `package.json` description 与 `locale\en.json`、`locale\zh.json` | 未提及 ground/outline/knowledge 等 0.2.x 能力；字段齐全、en/zh 结构一致 |
| D4 | 源码工作树与打包产物漂移 | `docs\TSINGHUA-INTEGRATION.md` 源 46986 B（14:51:29）vs 安装 44286 B（14:48:38）；`community\index.example.json` 源 0.2.2 vs 安装 0.1.0；`package.json` 源多末尾空行（1061 vs 1060 B） | 安装产物自洽（tgz 20/20 = 安装副本）；差异来自 0.2.2 打包后的并行编辑，非本任务写入。若需对外发布这些更新，需重新构建并安装 |
| D5 | 代码风格 | 安装副本 `lib\gate.js:391` | 函数体首句与函数声明同行（`function checkRights(dir) {  const ...`），代码有效、测试通过 |

## 十三、复现步骤

1. 核对安装版本：读 `~\.dsh\profiles\desktop\node_modules\dsh-teaching-material-workbench\package.json` 的 `version`（0.2.2）与 `~\.dsh\profiles\desktop\package.json` 依赖；对照 `.plugin-manager\logs\` 下三次升级日志；`tar -xzf` 后与安装副本逐文件哈希对比应 20/20 一致。
2. 建案例：空目录调用 `teaching_material_init`（参数见第二节第 1 行）；0.2.2 应返回 19 个文件，含 `knowledge.csv` 与 `verification/trial-design.template.md`。目录已有 `lesson.yml` 时工具报 `case already exists`。
3. 填数据：按第三节写数据文件与 teacher-pack.md。关键约束：至少 2 条 primary 且 verified=yes；claims 每条写 claim/source_id/locator/status；teacher-pack 至少 1 处 `[Sxx]`；knowledge.csv 每行 concept/source_id/locator 齐全且 locator 不得是 `p.`、`页`、`全书`、`网络` 一类粗定位；rubric 合计等于 `assessment.total_marks`；timeline 合计等于 `duration_min`。
4. 回归 schema（安装目录执行）：

```
cd %USERPROFILE%\.dsh\profiles\desktop\node_modules\dsh-teaching-material-workbench
node --input-type=module -e "import('./lib/index.js').then(m=>{console.log('tools='+m.TOOLS.length);for(const t of m.TOOLS){m.assertToolSchema(t);console.log('SCHEMA-OK '+t.name)}})"
```

预期 `tools=7` 与 7 行 `SCHEMA-OK`；出现 `Invalid schema` 即回归。
5. 跑工具序列：outline → gate → audit → ground → repro → standards。预期：gate 12/0/3（15 项）；audit 3/2/1/1 且 issues 0；ground 3/2/1/0、coverage 66.7%、markers 5；repro 4 个产物。
6. 哈希复算：`Get-FileHash <产物> -Algorithm SHA256` 与 `verification\repro.json` 比对，4 项应全 MATCH。
7. 单元测试：在源包目录运行 `node --test`，应为 `tests 21 / pass 21 / fail 0`。

## 十四、逐条验收结论

| 验收标准 | 结论 | 证据 |
|---|---|---|
| 7 个工具至少各成功调用一次（0.2.2） | 通过 | 第二节调用表，7/7 有实际返回与产物 |
| gate 无 fail，skip 允许且列明 | 通过 | 12 通过 / 0 失败 / 3 未执行；3 项 skip 在第四、十一节单列 |
| audit 输出许可统计 | 通过 | 来源 3、已核验一手 2、二手 1、受限 1、issues 0（第六节） |
| repro 输出 sha256 且可复核 | 通过 | 4 个产物完整 sha256；独立复算 4/4 MATCH（第六节） |
| skill 可见且可按名读取 | 通过 | 第八节：目录可见、skill 工具读取成功、文件哈希与运行时描述一致 |
| locale/icon/manifest 存在且字段一致 | 通过（附 5 项低风险文档滞后，见第十二节） | 第九节逐项检查 |
| 新增门禁给出实际结果 | 通过 | 第五节：E2-knowledge PASS（4 概念）；grounding 粗定位规则与失败分支有代码与测试；E3-pilot 三分支有测试、本案例 skip 列明 |
| 记录实际安装版本 | 通过 | 第一节：0.2.2，含三次升级日志、profile 依赖、tgz 与安装副本 20/20 一致性 |
| claims.csv 至少 1 条 supported 且 teacher-pack 带 [S01] | 通过 | 第三节：3 条 claims（supported 2），5 处 `[Sxx]` 标记，E2-grounding PASS |
| 报告写在本插件 verification/ 下 | 通过 | 本文件即报告 |
| 未改插件代码、未重装插件 | 通过 | 本次只新增案例目录与本报告；源码、README、locale、manifest、profile 未修改 |

## 十五、声明

- 报告结论全部来自本会话工具返回、文件内容或命令输出，未引用 Lead 的冒烟结论。
- 本次写入范围：`D:\团聚体\桌面\英语教学\我的学习\verification\case-acceptance\` 与本报告 `D:\团聚体\桌面\英语教学\我的学习\plugins\dsh-teaching-material-workbench\verification\plugin-acceptance.md`。
- 验收期间源码工作树的并行编辑（第十二节 D4）不属于本任务写入，不影响安装版 0.2.2 的验收结论。
