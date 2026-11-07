# 清华大学教育智能体中的教学物料能力：核验与纳入方案

- 研究对象：清华系教学智能体与相关平台（OpenMAIC、清华大学 AI 助教、MAIC 平台等）中与“教学物料制作”有关的工具、方法与经验。
- 目标插件：`dsh-teaching-material-workbench`。
- 网页访问日期：2026-11-07（Asia/Shanghai），下文每条网页事实均为此日访问。
- 本地源码读取日期：2026-11-07。
- 取证方式：只取官方站点、官方仓库、原始许可文件、官方媒体稿；二手测评、第三方高校通知不计入事实表。报道中的数据按“报道所述”记录，不当作独立实验证据。
- 版本说明：任务书以 5 个工具为基准（插件 0.1.0）。核验期间插件升到 0.2.2（2026-11-07，已安装）：0.2.0 新增 `teaching_material_ground` 与 `teaching_material_outline`；0.2.1 并入本方案的三项 P0（`knowledge.csv` 加 `E2-knowledge`、locator 过粗检测、E3-pilot 加固与单盲字段）；0.2.2 强制试点设计模板，并扩展来源角色分类。已实现项在 2.1 单列并写清华对照；剩余建议在 2.2 与第 3 节。
- 测试证据：2026-11-07 在插件根目录运行 `node --test tests/core.test.js`，21 项通过、0 项失败，覆盖接地失败、locator 过粗、无效知识库行、未填试点数据、试点设计强制、大纲生成等用例（L43）。

## 0. 结论

1. 许可冲突已定位：仓库 `LICENSE` 原文与 GitHub API 都是 MIT；`openmaic.io` 多个页面仍写 AGPL-3.0。仓库版本说明记 v0.3.0（2026-06-28）改为 MIT，官网未同步。有效许可取仓库 `LICENSE` 原文，即 MIT。根 MIT 不覆盖子包 `packages/mathml2omml`（LGPL-3.0-or-later），所以不建议复制其代码。
2. 清华经验里最可移植的是四件事：知识库加知识点抽取、结构化大纲、写作评价量规、真实课堂试点证据。前三件已在本插件落地：ground 与 outline 在 0.2.0，知识库清单、locator 粒度与单盲试点模板在 0.2.1，0.2.2 强制试点设计并扩展来源角色分类；写作反馈量规仍是方案。
3. 本方案原有三项 P0 已被 0.2.1 并入实现：`knowledge.csv` 加 `E2-knowledge`、locator 过粗检测、单盲试点设计加 E3-pilot 加固；0.2.2 补上试点设计强制与 role 分类。剩余建议集中在 P1：接地覆盖率门槛、大纲场景类型、写作反馈量规，以及审计报告的材料分类统计。
4. 明确不纳入：LLM 生成环节、PPTX/视频渲染、多智能体课堂、学生端助手、平台化部署。原因分属许可、技术栈、版权与范围，见第 4 节。
5. 超越指标 4 项，全部可在案例目录内客观计数：证据链定位覆盖率、可复现哈希一致率、E3 真实性、版权合规。逐项测法与 PowerShell 命令见 5.2。竞品没有公开的对等产物，比较只限“公开材料能否被独立核验”，不宣称教学效果更优。
6. 已实现工具可调用：`teaching_material_ground` 与 `teaching_material_outline` 已在本会话工具表注册（2026-11-07 更新），参数只有案例目录一个；`knowledge.csv` 是 0.2.1 新增的可选数据文件，由 `E2-knowledge` 检查。
7. 0.2.2 的改动只经过源码与测试核验（21 项通过）；真实案例端到端结果由独立验收任务负责，本文写作时尚未读到验收报告。

## 1. 事实表

### 1.1 OpenMAIC 仓库与许可

| 编号 | 对象 | 已核验事实 | 证据 | 页面日期 | 状态 |
|---|---|---|---|---|---|
| L01 | 仓库基本指标 | `THU-MAIC/OpenMAIC`，TypeScript，默认分支 main；星标 42,851，复刻 6,593，开放议题 207；创建 2026-03-11，最近推送 2026-11-06（UTC） | [仓库 API](https://api.github.com/repos/THU-MAIC/OpenMAIC)（字段 stargazers_count、forks_count、license、created_at、pushed_at） | 2026-11-07 取值 | verified |
| L02 | 仓库许可文件 | `LICENSE` 原文为 MIT License，版权行 Copyright (c) 2026 THU-MAIC | [LICENSE 原文](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/LICENSE) | 2026-11-07 访问 | verified |
| L03 | 平台返回许可 | `license.spdx_id` 为 MIT | [仓库 API](https://api.github.com/repos/THU-MAIC/OpenMAIC) | 2026-11-07 取值 | verified |
| L04 | 仓库自述许可 | README 徽章为 License-MIT；合作段写明 MIT 许可、可免费商用；License 段写 MIT License；引用段列出 JCST 论文条目 | [README](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md) | 2026-11-07 访问 | verified |
| L05 | 许可变更记录 | 发布记录 v0.3.0（2026-06-28）写明 relicensed to MIT | [README 发布记录](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md) | 2026-11-07 访问 | verified |
| L06 | 第三方子包许可 | `packages/mathml2omml` 为 LGPL-3.0-or-later；`packages/pptxgenjs` 为 MIT；README 说明根 MIT 不覆盖这些子包 | [README 许可段](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md) | 2026-11-07 访问 | verified |
| L07 | 官网许可声明 | 开源教育页与全站页脚写“基于 AGPL-3.0 许可证发布”，并称可提供商业授权 | [开源教育页](https://openmaic.io/zh/openmaic-open-source-education.html) | 2026-11-07 访问 | verified（页面原文如此，与仓库冲突） |
| L08 | 冲突判定 | 仓库 LICENSE、GitHub API、README 三者一致为 MIT；官网声明滞后于仓库。有效许可取 LICENSE 原文；官网为何未更新，未见官方说明 | L02、L03、L04、L05 与 L07 对比 | 2026-11-07 | partial（判定为对比所得，官方解释未取得） |
| L09 | 论文 | JCST 期刊页面标题为 From MOOC to MAIC: Reimagine Online Teaching and Learning Through LLM-Driven Agents，DOI 10.1007/s11390-025-6000-0；README 引用条目列出 22 位作者；卷、期、页码字段为空 | [JCST 页面](https://jcst.ict.ac.cn/en/article/doi/10.1007/s11390-025-6000-0)、[README 引用段](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md) | 论文 2026；访问 2026-11-07 | 标题与 DOI verified；卷期页码 not-obtained |
| L10 | 技术栈与运行条件（仓库自述） | 徽章写 Next.js 16、React 19、TypeScript 5、Tailwind CSS 4；运行要求 Node ≥22.19、pnpm ≥10、PostgreSQL 16；1.2.0 起为 server-first，课程生成在常驻 Node 进程内运行 | [README 快速开始](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md) | 2026-11-07 访问 | verified |
| L11 | 技术栈（官网自述） | 官网写编排用 LangGraph、可部署 Vercel；README 写 1.2.0 起需常驻 Node 进程与 PostgreSQL，Vercel 仅支持到 1.1.x，结构段写自研 Pi director loop。官网另写 28+ 课堂动作，README 写 21 种 action。两处不一致，官网未同步 | [开源教育页](https://openmaic.io/zh/openmaic-open-source-education.html)、[AI 教学助手页](https://openmaic.io/zh/openmaic-ai-teacher-assistant.html)、[README](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md) | 2026-11-07 访问 | partial（差异已核验，原因未验证） |

### 1.2 OpenMAIC 功能

| 编号 | 对象 | 已核验事实 | 证据 | 页面日期 | 状态 |
|---|---|---|---|---|---|
| L12 | 课程生成 | 两阶段流水线：先大纲，后场景；输入可以是主题，也可以是 PDF、Word、PPT、表格、文本、图片、音频、视频；输出幻灯片、测验、交互模拟、项目制学习活动 | [README 功能段](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md)、[课程生成器页](https://openmaic.io/zh/openmaic-online-course-generator.html) | 2026-11-07 访问 | verified |
| L13 | 知识库 | v1.3.0（2026-10-29）：上传材料保留在所有者知识库，按文件夹组织，一次解析供多个会话使用，输入框用 @ 调用，agent 可读、可搜、可整理 | [README 发布记录](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md) | 2026-11-07 访问 | verified |
| L14 | 导出 | PPTX 保留每个场景，含图片、图表、LaTeX 转 Office MathML、演讲者备注；另有离线单文件 HTML、Resource Pack、Classroom ZIP | [README 导出段](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md)、[PPTX 导出页](https://openmaic.io/zh/openmaic-pptx-export-tool.html) | 2026-11-07 访问 | verified |
| L15 | Agent 工作台 | 24 个内置技能覆盖课程规划、深度研究、多种课型、幻灯片与舞台、PPTX 导入与编辑、样式复用；通过显式、可校验的工具操作，而不是直接改不透明对象 | [README 工作台段](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md) | 2026-11-07 访问 | verified |
| L16 | 课堂组件 | 测验支持单选、多选、简答并实时批改反馈；多智能体讨论、圆桌辩论、问答；SVG 白板；语音合成与语音识别 | [README 功能段](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md)、[AI 互动课堂页](https://openmaic.io/zh/openmaic-ai-interactive-classroom.html) | 2026-11-07 访问 | verified |
| L17 | 多语种 | 12 个 locale，覆盖 11 种语言 | [README i18n 段](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md) | 2026-11-07 访问 | verified |
| L18 | 数据与部署 | 课程与媒体存 PostgreSQL，媒体可选 S3；四种归属模式：单用户、共享团队、匿名、自有账号 | [README 持久化段](https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md) | 2026-11-07 访问 | verified |

### 1.3 清华大学 AI 助教（2024 年报道）

| 编号 | 对象 | 已核验事实 | 证据 | 页面日期 | 状态 |
|---|---|---|---|---|---|
| L19 | 报道出处 | 清华大学新闻网“媒体清华”栏转载《新京报》客户端稿件，记者冯琪，网站标注来源 3-26，发布时间 2024-03-27 08:26:37，编辑李华山 | [清华新闻网](https://www.tsinghua.edu.cn/info/1182/110370.htm) | 2024-03-27 | verified（作为已刊载文本） |
| L20 | 底座与试点规模 | 以千亿参数多模态大模型 GLM 为平台与技术基座，研发多个 AI 助教系统；2023 年秋季学期起 8 门课程试点，5 门完成第一阶段开发并初步使用 | 同上 | 2024-03-27 | verified（按报道所述） |
| L21 | 知识库方法 | 以教师提供的教材、习题、最新论文等材料建知识库，自动抽取知识点；知识库辅助把通用模型答题正确率从 80% 提到 95%，并附详细答题解释（“新城市科学”课，龙瀛） | 同上 | 2024-03-27 | verified（按报道所述；测量方法未披露） |
| L22 | 材料规模 | 学习 20 余万字同名教材、38 节慕课课件、1200 多篇中英文论文、280 个报告案例，并输入虚拟教研室知识图谱 | 同上 | 2024-03-27 | verified（按报道所述） |
| L23 | 功能卡片 | 按大作业三个模块，定义五类共 25 个功能卡片（问题模板），如选什么数据、空间使用行为变化、改造可能性 | 同上 | 2024-03-27 | verified（按报道所述） |
| L24 | 写作评价与单盲试验 | AI 助教生成写作评价标准并给出具体评价；每周 2 题、每篇 500-800 字；两名博士后助教批改；向模型提供心理学资料、真人批改方法与鼓励话术；调试一学期后做单盲试验，学生在内容准确性、结构清晰性、认同感、帮助性上评分不输真人助教，部分更优（“心智、个体与文化”课，钱静） | 同上 | 2024-03-27 | verified（按报道所述；试验设计细节未披露） |
| L25 | 版权与开放范围疑虑 | 龙瀛提出投喂大模型的物料如何处理版权，并问慕课 10 万学习者能否使用；报道未给解决方案 | 同上 | 2024-03-27 | verified（按报道所述，属提问而非结论） |
| L26 | 2024 年计划 | 2024 年开展 100 门人工智能支持教学的试点课程 | 同上 | 2024-03-27 | verified（按报道所述） |

### 1.4 清华官方其他材料

| 编号 | 对象 | 已核验事实 | 证据 | 页面日期 | 状态 |
|---|---|---|---|---|---|
| L27 | 课程规模与功能场景 | 官网专页：2023 年秋季学期起 451 门课程开展人工智能支持的教学实践，实现 AI 学伴、AI 讲伴、备课助手等十大功能场景；建设领域知识图谱与学科知识引擎 | [清华官网专页](https://www.tsinghua.edu.cn/info/3177/118143.htm) | 2025-04-16 | verified |
| L28 | 学生助手与规范 | 2024-08-14 上线学生 AI 成长助手“清小搭”；发布《清华大学人工智能教育应用指导原则》；2025 年 2 月上线人工智能素养网站，接入 DeepSeek、智谱清言、Kimi 等模型 | 同上 | 2025-04-16 | verified |
| L29 | MAIC 平台 | 清华大学学生学习与发展指导中心页面：MAIC（Multi-Agent Interactive Classroom）为清华大学自主研发建设的大规模因材施教多智能体课堂平台，由 AI 教师、AI 助教、AI 学伴构成；入选教育部国家智慧教育平台首批 AI 示范应用；称已服务全国超过 30 万用户、产生超过 2000 万次交互；网址 maic.tsinghua.edu.cn | [MAIC 页面](https://learning.tsinghua.edu.cn/info/1273/2021.htm) | 2024-11-04 | verified（官方页面）；用户与交互数 partial（平台口径，未见方法） |
| L30 | 其他清华系教学智能体 | 本次检索范围（tsinghua.edu.cn、learning.tsinghua.edu.cn）未发现其他由清华官方发布、面向教学物料制作的工作台；雨课堂类 AI 功能只见其他高校教务处通知，非清华一手材料，不计入 | 检索记录：上述两站点 | 2026-11-07 | not-obtained |

### 1.5 同类产品公开事实

| 编号 | 对象 | 已核验事实 | 证据 | 页面日期 | 状态 |
|---|---|---|---|---|---|
| L31 | MagicSchool | 官方帮助中心：教师工具 60 余个、学生工具 50 余个；覆盖教案生成、单元计划、5E 教案、评分量规、测验、分层材料、写作反馈、学生房间；套餐分 Free、Plus、Enterprise | [帮助中心](https://help.magicschool.ai/en/articles/16738030-student-tools-teacher-tools-overview) | 2026-09-01 | verified |
| L32 | HaiMate | 科技日报报道：海亮科服推出 HaiMate 教师 AI 工作台；课前备课、课堂复盘、成绩分析、教学优化可在同一个对话式入口完成；多个功能模型协助优化教案、课件 | [科技日报](https://www.stdaily.com/web/gdxw/2026-10/28/content_604250.html) | 2026-10-28 | verified（媒体报道） |
| L33 | HaiMate 另一报道 | 央广网同题报道，标题为海亮科技发布 HaiMate，打造教师专属一站式 AI 工作台；网页正文编码异常，未能可靠读取 | [央广网](https://zj.cnr.cn/qxkx/20261030/t20261030_527858052.shtml) | 2026-10-30 | partial（仅标题与链接可用） |
| L34 | 三者的证据产物 | OpenMAIC、MagicSchool、HaiMate 的公开功能页与 README 均未描述“claim 级来源登记、门禁报告、产物哈希清单、版权审计报告”这类产物；这是对公开材料的结构性观察，不能据此断言其内部没有类似能力 | 上述页面与 README | 2026-11-07 | not-obtained |

### 1.6 本插件基线（本地源码）

| 编号 | 对象 | 已核验事实 | 证据 | 读取日期 | 状态 |
|---|---|---|---|---|---|
| L35 | 版本 | 0.2.2（2026-11-07）：新增 `verification/trial-design.template.md` 并强制，pilot 数据无设计记 fail、有设计无数据记 skip；`sources.role` 增 exercise、slides、case、lecture 四值，表头不变。0.2.1 并入三项 P0（`knowledge.csv` 加 `E2-knowledge`、locator 过粗检测、E3-pilot 加固与单盲字段）；0.2.0 为 ground 与 outline 版本，0.1.0 为五工具版本 | `CHANGELOG.md:3-20` | 2026-11-07 | verified |
| L36 | 工具面 | `TOOLS` 数组含 7 个工具：init、gate、audit、repro、ground、outline、standards | `lib/index.js:486` | 2026-11-07 | verified |
| L37 | 门禁项 | 15 项检查：E1-schema、E1-timeline、E1-alignment、E1-rubric-sum、E1-consistency、E2-sources、E2-knowledge、E2-rubric-source、E2-grounding、E2-accessibility、E2-language、E2-rights、E1-build、E3-human、E3-pilot | `lib/gate.js:582-598` | 2026-11-07 | verified |
| L38 | 来源字段与分类 | `sources.csv` 表头 11 字段不变；`role` 枚举 13 值，0.2.2 增加 exercise、slides、case、lecture | `lib/templates.js:3-12`、`lib/gate.js:16-23` | 2026-11-07 | verified |
| L39 | 试点模板与设计 | `pilot.csv` 模板 7 列（id、item、metric、value、n、design、note），`design` 默认 single-blind；`verification/trial-design.template.md` 由 init 生成，含研究问题、分组、盲法、评分者、样本量依据、主要指标、分析计划；0.2.2 起有 pilot 数据但无 trial-design.md 记 fail，有设计无数据记 skip | `lib/templates.js:172-219`、`lib/index.js:166-170`、`lib/gate.js:562-580` | 2026-11-07 | verified |
| L40 | 接地与知识库检查 | 接地审计新增 locator 过粗检测（`COARSE_LOCATOR`，匹配 p.、页、全书、网络、见教材、待补等）；`E2-knowledge` 对 `knowledge.csv` 做概念、来源、定位三项检查，行数为 0 记 skip；覆盖率仍只报告、未设阈值 | `lib/gate.js:407-498` | 2026-11-07 | verified |
| L41 | 概念级实现与剩余缺口 | `knowledge.csv` 表头为 concept、source_id、locator、note，已有概念级清单；但无 objective 映射、无 covered/partial/gap 状态、无覆盖率门槛 | `lib/templates.js:3-12`、`lib/gate.js:407-427` | 2026-11-07 | verified |
| L42 | 两个新工具已注册可调用 | 本会话工具表包含 `teaching_material_ground` 与 `teaching_material_outline`，参数均为 directory；工具描述分别为“知识库接地审计，对齐检索增强式 AI 助教做法”“由结构化数据生成课件大纲” | 本会话工具定义（2026-11-07 更新）、`lib/index.js:345-435` | 2026-11-07 | verified |
| L43 | 测试结果 | 运行 `node --test tests/core.test.js`，21 项通过、0 项失败；含接地失败、locator 过粗、无效知识库行、未填试点数据、试点设计强制、缺 claims.csv 记未执行、大纲生成等用例 | 本机命令输出，2026-11-07 | 2026-11-07 | verified |
| L44 | 方案与实现的对应 | 0.2.1 的 `knowledge.csv` 与 `E2-knowledge` 对应本方案 M1；locator 过粗检测与 0.2.2 的 role 分类对应 M4；trial-design 模板、E3-pilot 加固、单盲字段对应 M3；outline 的情境信息与知识库定位段对应 M5 的来源标记部分 | `CHANGELOG.md:3-20`、`lib/gate.js:407-498`、`lib/outline.js:36-100` | 2026-11-07 | verified |

## 2. 能力映射表

映射原则：清华做法只转成“数据字段”与“检查规则”，不搬代码、不搬提示词、不搬课程内容。新增数据一律用新的可选文件，避免改动现有 CSV 表头。原因是 `E1-schema` 对表头做逐字比对（`lib/gate.js:107-113`），加列会让旧案例全部失败。

### 2.1 已实现：工具与数据检查对清华做法的承接

| 已实现项 | 做什么 | 输入与数据 | 输出产物 | 校验语义 | 清华对应做法与证据 | 与清华做法的差距 |
|---|---|---|---|---|---|---|
| `teaching_material_ground`（0.2.0 工具，0.2.1 加 locator 过粗检测） | claim 级知识库接地审计：每条结论要有来源与定位，teacher-pack 要带 [Sxx] 标记 | `claims.csv`（id、claim、source_id、locator、status、note） | `verification/grounding-report.md`；工具返回 claims、supported、partial、unsupported、coverage、cited_markers | unsupported 必须清零；issue 不得存在；[Sxx] 标记数必须大于 0；locator 长度小于 2 或命中过粗词表即 fail；缺 `claims.csv` 记 skip，不算通过 | 清华 AI 助教用教材、习题、论文、案例建知识库并做检索增强，把答题正确率从 80% 提到 95%，并附详细解释（L21、L22）；我们把“检索增强”落成可检查的 claim 到来源加定位的映射 | 清华有自动知识点抽取与知识图谱；我们只做到 claim 与概念两级清单，没有目标映射与覆盖率门槛（M1 剩余、M2） |
| `teaching_material_outline`（0.2.0 工具，0.2.1 加情境信息与知识库定位段） | 由结构化数据生成确定性的逐页课件大纲 | `lesson.yml`、`profile.yml`、`timeline.csv`、`rubric.csv`、`glossary.csv`、`knowledge.csv`、`sources.csv` | `build/outline.md`；工具返回 outline_path、slides、timeline_rows | 不调用模型，同一数据必然得到同一文件；页数由时间轴段数加评分标准页、术语页推导；知识库定位表与来源表附在大纲末尾 | OpenMAIC 两阶段生成：先大纲后场景，AI 教师按幻灯片授课（L12、L16）；我们把“大纲先行”落成确定性数据产物，再交给外部排版工具 | OpenMAIC 的场景带类型与交互（测验、模拟、PBL），我们只有段落级页面，没有场景类型字段（M5 剩余）；OpenMAIC 直接导出 PPTX，我们明确不做渲染（N2） |
| `knowledge.csv` 加 `E2-knowledge`（0.2.1） | 概念级知识库清单：把关键概念映射到来源与定位 | `knowledge.csv`（concept、source_id、locator、note） | gate-report 的 `E2-knowledge` 行；大纲的“知识库定位”段 | 概念、来源、定位三项不得为空；来源必须存在于 sources.csv；locator 过粗即 fail；没有数据行记 skip | 清华 AI 助教的知识库与知识点抽取（L21、L22），官方页面提到领域知识图谱与学科知识引擎（L27）；我们把“知识点”落成可检查的概念到来源映射 | 没有 objective 与概念的对应关系，没有 covered/partial/gap 状态，覆盖率只在大纲里列出、没有门禁（M1 剩余） |
| 单盲试点模板加 `E3-pilot` 加固（0.2.1 起；0.2.2 强制 trial-design） | 试点证据从“有文件”升级到“有设计且已填数” | `verification/trial-design.template.md`、`pilot.csv`（design 默认 single-blind）、`peer-review.template.md`（design、blind 字段） | `verification/trial-design.md`、`pilot.csv`、gate-report 的 `E3-pilot` 行 | 有数据无设计记 fail；有设计无数据记 skip；value 与 n 为空记 fail（仍是模板）；设计文件至少含研究问题、盲法、样本量、主要指标四项中的三项 | 清华钱静课的单盲试验，比较 AI 与真人助教在内容准确性、结构清晰性、认同感、帮助性四个维度的评价（L24） | 只做证据设计模板，不做统计检验与评分者一致性计算；四个评价维度没有落成字段（M3 剩余部分） |

证据：代码在 `lib/index.js:345-435`、接地与知识库检查在 `lib/gate.js:407-498`、试点检查在 `lib/gate.js:562-580`、大纲生成在 `lib/outline.js:36-108`；测试在 `tests/core.test.js`；2026-11-07 测试 21 项全过（L43）；两个工具已在本会话可用（L42）。

### 2.2 待纳入与剩余增强能力

| 编号 | 清华做法与证据 | 建议能力 | 实现状态 | 输入 | 输出 | 校验方式 | 与现有工具关系 | 外部依赖 |
|---|---|---|---|---|---|---|---|---|
| M1 | 知识库材料加自动知识点抽取、知识图谱（L21、L22、L27） | `knowledge.csv` 增强：objective 映射、covered/partial/gap 状态与覆盖率 | 部分实现（0.2.1 已有 `knowledge.csv` 与 `E2-knowledge`） | 在 concept、source_id、locator、note 之外增 objective_id 与 status 两列 | 大纲的知识库定位段加 objective 与状态两列；gate-report 写出覆盖率 | 每个 objective 至少对应 1 个概念；status 仅 covered、partial、gap；存在 gap 或 objective 无概念即 fail；覆盖率写入报告 | 在 0.2.1 的 `E2-knowledge` 上扩展，不新增文件；ground、audit、repro、standards 不变 | 无 |
| M2 | 知识库把答题正确率从 80% 提到 95% 并给解释（L21） | `teaching_material_ground` 增覆盖率门槛 | 未实现（0.2.1 仍只报告覆盖率） | 现有 `claims.csv`、`teacher-pack.md` | 报告增“实质段落引用覆盖率”；gate-report 列出未达标段落 | 带 [Sxx] 的实质段落数除以实质段落总数；默认门槛 0.8，可在 `profile.yml` 的 thresholds 覆盖；门槛未达标记 fail；缺 `claims.csv` 仍记 skip | 改 ground 返回与 gate 的 `E2-grounding`，不新增文件 | 无 |
| M3 | 单盲试验比较 AI 与真人助教（L24） | 试点证据增强：四个评价维度与评分者一致性 | 大部分实现（0.2.1 已有 trial-design 模板、E3-pilot 加固、单盲字段） | 在 `pilot.csv` 增维度列（内容准确性、结构清晰性、认同感、帮助性）与 rater_id | pilot 维度统计；双评一致性报告 | 每个维度有 value 与 n；两名及以上评分者时输出 Cohen's kappa，低于 0.7 列问题 | 扩展现有模板与 `E3-pilot`，不新增工具 | 无 |
| M4 | 四类材料（教材、习题、论文、案例）加版权疑虑（L22、L25） | 来源分类扩展与审计统计 | 部分实现（0.2.1 有 locator 过粗检测，0.2.2 有 role 分类） | 沿用 `sources.csv` | `verification/rights-report.md` 增“材料分类统计”与“定位粒度”两段 | `role` 已增 exercise、slides、case、lecture 四值（0.2.2），旧值仍合法；按分类计数写入报告待做；locator 过粗检测已在 ground 与 E2-knowledge 中生效 | audit 报告增分类统计；表头不变，旧案例不破 | 无 |
| M5 | 两阶段生成，场景有类型；AI 教师按幻灯片授课（L12、L16） | `teaching_material_outline` 增强：场景类型与逐页来源标记 | 部分实现（0.2.1 已有情境信息与知识库定位段） | 在 `timeline.csv` 增 scene_type 列，或由段名推导 | `build/outline.md` 每页含场景类型与 [Sxx] 或“无外部来源” | 场景类型枚举必填：讲授、练习、讨论、测验、小结、作业；页数与 timeline 段数一致；每页至少一个来源标记或显式声明 | 改 outline 输出与 gate 的 `E1-build` 附带检查；init 不变 | 无 |
| M6 | 生成写作评价标准并给具体评价（L24） | `feedback-rubric.csv`：写作反馈量规 | 未实现 | 写作类案例的题目、评分量规、来源 | `feedback-rubric.csv`；`teacher-pack.md` 反馈段 | 每条 criterion 至少 2 个 band；band 描述含可观察行为；criterion 与 lesson 的 assessment 对齐；引用 source 存在 | init 写可选表头；gate 增 `E2-feedback`，缺文件记 skip；与 rubric.csv 分工：rubric 记分，feedback 记反馈层级 | 无 |
| M7 | 报道提到过程性评价、学生档案设想；官方页面列备课助手等场景（L24、L27） | `debrief.csv`：教师复盘记录 | 未实现 | timeline、实际用时、学生证据 | `debrief.csv`；teacher-pack 附录 | 每段实际用时与计划偏差超过 20% 须写原因；未填记 skip | init 写可选表头；gate 增 `E1-debrief` | 无 |
| M8 | 五类 25 个功能卡片（L23） | `cards.csv`：结构化提问卡片 | 未实现 | 课堂提问场景、objective | `cards.csv`；teacher-pack 提问段 | 每张卡片写明 objective、prompt、使用时机；卡片不得含未登记来源的结论 | init 写可选表头；gate 增轻量检查；与 alignment 的 student_activity 呼应 | 无 |

### 2.3 关键取舍

- 不把“生成”塞进插件。清华做法里的生成能力由 GLM 底座与多智能体系统承担，本插件没有模型调用，也不联网。物料的生成可以交给 DSH 会话模型或外部工具，但每条结论必须落进 `claims.csv`，概念要落进 `knowledge.csv`，才能过门禁。这样责任留在人，证据留在文件。
- 新增文件而不是扩展旧表头。旧案例的表头已经固定，`E1-schema` 逐字比对；新增可选文件配合 skip 语义，旧案例继续可用。
- 知识库只登记定位，不存原文。清华报道里的 20 余万字教材、1200 多篇论文、280 个案例属于教师提供的受版权保护材料，我们只允许登记来源与定位，原件不入案例目录，这与现有 `E2-rights` 的规则一致。
- 单盲试验当“证据设计模板”用，不当效果承诺。报道只给出“单盲”这一名称与四个评价维度，样本量、盲法细节、统计量都没有公开。模板要求使用者自己写清这些，写不清就是 skip，不冒充通过。

## 3. 纳入优先级

工作量均为估算，未实测。一个人日按 8 小时计。

### 3.1 汇总与建议

0.2.2 已并入本方案三项 P0 的主体，继续立项的只剩增强项。建议分两档：P1 建议做（成本低，直接补证据链），P2 暂缓（证据薄或超出主线）。

| 编号 | 能力 | 优先级 | 状态（0.2.2） | 建议 | 依赖 | 工作量估算 | 主要风险 |
|---|---|---|---|---|---|---|---|
| M1 | 知识库 objective 映射与覆盖率 | P1 | 部分实现 | 建议做 | 无 | 0.25 到 0.5 人日 | 概念粒度不统一，覆盖率口径要固定为 objective |
| M2 | 接地覆盖率门槛 | P1 | 未实现 | 建议做 | 依赖 M1 增强 | 0.5 人日 | 正则判断“实质段落”会误判 |
| M4 | 来源分类与审计统计 | P1 | 部分实现 | 建议做（成本最低） | 无 | 0.25 到 0.5 人日 | 分类统计要按来源去重 |
| M5 | 大纲场景类型与逐页标记 | P1 | 部分实现 | 建议做 | 无 | 0.5 人日 | 枚举需可扩展，别把学科内容写进类型 |
| M6 | 写作反馈量规 | P1 | 未实现 | 按需做 | 无 | 1 人日 | 与 rubric 概念重叠 |
| M3 | 试点评价维度与评分者一致性 | P2 | 大部分实现 | 暂缓 | 需要真实双评数据 | 0.5 到 1 人日 | 没有数据时字段空转 |
| M7 | 教师复盘记录 | P2 | 未实现 | 暂缓 | 无 | 0.5 人日 | 清华一手证据薄 |
| M8 | 结构化提问卡片 | P2 | 未实现 | 暂缓 | 无 | 0.5 人日 | 超出物料制作主线 |

### 3.2 已并入 0.2.1 与 0.2.2（不再立项）

- M1 主体：`knowledge.csv` 与 `E2-knowledge` 已实现（L35、L40、L44）。剩余的是 objective 映射与覆盖率，列为 M1 增强项。
- M3 主体：trial-design 模板、E3-pilot 加固、单盲字段已实现（L39、L44）。剩余的是四个评价维度与评分者一致性。
- M4 的定位粒度与分类部分：locator 过粗检测已在 ground 与 E2-knowledge 生效（L40），role 分类已在 0.2.2 扩展（L35、L38）。剩余的是 audit 报告的分类统计段。
- M5 的来源标记部分：大纲已输出情境信息与知识库定位表（L44）。剩余的是场景类型与逐页来源标记。

### 3.3 P1 剩余建议（依赖与风险）

- M1 增强：`knowledge.csv` 加 objective_id 与 status 两列。风险是改表头会让 0.2.2 已生成案例的 `E1-schema` 失败（表头逐字比对）。缓解：两列设为可选，gate 按表头动态取列；或在 skill 里写明迁移步骤。工作量：0.25 到 0.5 人日。
- M2 覆盖率门槛：依赖 M1 增强后的概念数据。工作量：改 ground 返回、加阈值读取、文档，约半天。风险：段落切分靠规则，长表格与代码块会干扰计数。缓解：先报告后门槛，默认门槛 0.8，允许在 profile 覆盖。
- M4 剩余：audit 报告增材料分类统计段；工作量约 1 到 2 小时。风险：分类统计要按来源去重，避免一条来源计两次。
- M5 剩余：改 `lib/outline.js` 与 gate 的 `E1-build` 附带检查；工作量约半天。风险：枚举不适合所有学科。缓解：枚举只表达教学环节类型，允许“其他”并在报告里列出。
- M6 写作反馈量规：新表头、gate 检查、skill 说明、样例、测试，约一天。风险：与评分量规混淆。缓解：文档写明“rubric 记分，feedback 记反馈层级”。

### 3.4 P2 暂缓

- M3 剩余：四个评价维度与 Cohen's kappa 需要真实双评数据；没有数据时只是空字段。等有试点案例后再做。
- M7 教师复盘：清华一手证据只有报道里的一句设想与官方页面的功能名称，做成门禁容易过度设计；先作为 teacher-pack 的手写附录。
- M8 结构化提问卡片：服务课堂问答，不服务物料制作主线；清华原文卡片内容未公开，只能借鉴形式。

## 4. 不纳入项及原因

| 编号 | 不纳入对象 | 原因 |
|---|---|---|
| N1 | OpenMAIC 代码与提示词 | 根许可为 MIT，但子包 `packages/mathml2omml` 是 LGPL-3.0-or-later，整包搬运会带来跨许可与归属问题；官网仍写 AGPL-3.0，声明不一致本身增加法律不确定性。只借鉴流程概念，不取代码、不取提示词原文 |
| N2 | 课程渲染、PPTX 导出、视频导出 | OpenMAIC 用 Chromium render-service、pptxgenjs、ECharts 实现；与本插件零依赖、无网络、无安装脚本的约束冲突；本机已有 office、pptx 类技能承担渲染与排版 |
| N3 | 多智能体课堂、语音合成与识别、白板、3D 与模拟 | 属课堂交互产品范围，需要模型、TTS、ASR、浏览器运行时；插件定位是物料与证据，不是课堂 |
| N4 | 学生端 AI 伴学与课堂问答 | “清小搭”、MAIC 面向学生学习陪伴与课堂互动；评估对象是学生体验，不是物料质量，混进来会让证据链失焦 |
| N5 | LLM 生成与自动打分环节 | 物料的事实责任需要落到人；生成式输出无法逐条复现，会破坏 I2 与 I3 两项指标 |
| N6 | 知识库全文解析与原文存储 | MinerU 类解析依赖网络与重依赖；更关键的是版权，案例目录只允许登记来源与定位，原件不得入库（现有 `E2-rights` 已如此规定） |
| N7 | 多语种界面扩展 | 现有 locale 已有中英两版；清华项目的 12 语种是产品化需求，不是证据能力 |
| N8 | 把平台运营数据当效果证据 | MAIC 页面写着 30 万用户、2000 万次交互，OpenMAIC 有 4 万余星标；这些是采用度指标，不能证明物料质量或学习效果，本插件不引用为效果证据 |
| N9 | 把官网 AGPL 声明当作许可事实 | 有效许可取仓库 `LICENSE` 原文；同时也不因为仓库改为 MIT 就认为可以整包复制，第三方子包许可仍在 |
| N10 | 平台级部署与账户体系 | PostgreSQL、S3、Vercel 是应用服务器形态；DSH 插件以工具与技能注册为形态，不需要也不应携带数据库与账户 |

## 5. 超越指标

四项主指标（I1 到 I4）加一项自证指标（I5），全部在案例目录内可数、可复核，不依赖问卷或主观评分。每项给出读数文件、计算公式与 PowerShell 命令。竞品比较只到“公开材料层面”，见 5.4 的对等性限制。

### 5.1 指标定义与测法

| 编号 | 指标 | 计算与目标 | 测法与产物 | 与竞品的公开材料比较 |
|---|---|---|---|---|
| I1 | 证据链定位覆盖率 | 实质陈述中带 source_id 与 locator 的比例；目标 100%，unsupported 为 0，locator 不得过粗 | 取 `claims.csv` 行数与 `teacher-pack.md` 实质段落数，逐条对照；产物是 `verification/grounding-report.md` 与 `gate-report.md`；M2 落地后直接读覆盖率字段 | OpenMAIC、MagicSchool、HaiMate 的公开文档都没有 claim 级来源与定位字段（L34）；它们优化生成速度与课堂体验，不产出“每条结论可回溯”的检查表 |
| I2 | 可复现哈希一致率 | 同一数据两次构建，`repro.json` 的 sha256 一致数除以产物总数；确定性产物目标 100%，二进制产物差异必须书面说明 | 构建两次，各跑一次 `teaching_material_repro`，比对两份清单；报告一致数、差异数、差异说明条数 | OpenMAIC 的课程由模型采样生成，README 未承诺确定性；MagicSchool 与 HaiMate 公开材料没有哈希清单。此条比较基于公开说明，未核验其内部实现 |
| I3 | E3 真实性 | 声称“外部实证通过”的案例必须能指向 `peer-review.md`、`pilot.csv` 与 `trial-design.md`（0.2.2 起强制）；“无附件却 pass”的案例数目标 0 | 读 `gate-report.md` 的 E3 行，与 `verification/` 目录逐项对照；skip 必须写原因并单列 | 三家的公开材料都没有“未执行不等于通过”的门禁区分；平台侧宣传用用户规模与满意度，不是可复核的实证文件 |
| I4 | 版权合规 | 受限来源计数为 0、案例目录内原始材料文件为 0、许可字段完整率 100% | 跑 `teaching_material_audit`，读 `verification/rights-report.md`；扫描案例目录的 PDF、DOCX、PPTX 等原件 | OpenMAIC 知识库允许上传并保存任意材料（L13），公开文档未描述许可审计；MagicSchool 与 HaiMate 未提版权审计。我们把许可做成门禁，而不是留给用户自觉 |
| I5 | 跨情境移植成本 | 从 init 到 gate 无 fail 所需修改的文件数与耗时；目标每个情境不超过 1 人日 | 选 3 个不同情境（例如高中英语、大学通识、企业培训）各跑一遍，记录修改行数与耗时 | 竞品没有公开的移植成本数据，无法对等比较；此项只作自证，不作为对竞品的优势声明 |

### 5.2 逐项测法（可执行）

以下命令在案例目录（含 `profile.yml`、`claims.csv`、`build/`、`verification/` 的目录）内运行。工具调用写作 `工具名(directory=...)`，对应 DSH 工具。

**I1 证据链定位覆盖率**

1. 调用 `teaching_material_ground(directory=<案例目录>)` 与 `teaching_material_gate(directory=<案例目录>)`。
2. 读 `verification/grounding-report.md` 的结论条数与覆盖率，读 `gate-report.md` 的 `E2-grounding` 行。
3. 用命令复算：

```powershell
$c = Import-Csv .\claims.csv
"N = " + $c.Count
"M = " + ($c | Where-Object { $_.source_id -and $_.locator -and $_.status -eq 'supported' }).Count
"markers = " + (Select-String -Path .\teacher-pack.md -Pattern '\[S\d+\]' -AllMatches).Matches.Count
```

4. 判定：M 除以 N 应为 100%；ground 返回的 unsupported 必须为 0，issues 必须为空（locator 过粗会给 issue）；markers 必须大于 0。任何一条不满足即不通过，按报告逐条改数据，不改判据。
5. 记录：N、M、覆盖率、unsupported、markers 五项写入交付说明。

**I2 可复现哈希一致率**

1. 固定数据与模板，调用一次 `teaching_material_repro(directory=<案例目录>)`，把 `verification/repro.json` 复制为 `verification/repro-before.json`。
2. 用同一工具、同一参数重建 `build/` 产物，再调用一次 `teaching_material_repro`。
3. 比较两份清单：

```powershell
$a = (Get-Content .\verification\repro-before.json -Raw | ConvertFrom-Json).artifacts
$b = (Get-Content .\verification\repro.json -Raw | ConvertFrom-Json).artifacts
$same = 0
foreach ($x in $a) { $y = $b | Where-Object path -eq $x.path; if ($y -and $y.sha256 -eq $x.sha256) { $same++ } }
"一致 $same / 共 $($a.Count)"
```

4. 判定：Markdown 等确定性产物一致率必须 100%；Office 二进制若不一致，逐条写原因（生成器版本、时间戳、嵌入字体等）。没有原因的差异算未通过。
5. 记录：产物数、一致数、差异说明条数。

**I3 E3 真实性**

1. 读门禁报告的 E3 行：`Select-String -Path .\gate-report.md -Pattern 'E3-'`。
2. 逐行核对附件：

```powershell
@('peer-review.md','pilot.csv','trial-design.md') | ForEach-Object { "$_ " + (Test-Path (Join-Path .\verification $_)) }
```

3. 判定：`E3-human` 为 pass 必须有 `verification/peer-review.md`；`E3-pilot` 为 pass 必须有 `verification/pilot.csv` 与 `verification/trial-design.md`，且 pilot 的 value 与 n 不得为空（0.2.1 会拒绝未填模板），设计文件至少含研究问题、盲法、样本量、主要指标四项中的三项。无附件却显示 pass 的条数必须为 0；skip 必须在报告“未执行”一节列出原因。
4. 记录：E3 条数、pass 数、skip 数、无附件 pass 数。

**I4 版权合规**

1. 调用 `teaching_material_audit(directory=<案例目录>)`，读 `verification/rights-report.md` 的统计行与问题段。
2. 检查受限来源、许可空值与入库原件：

```powershell
(Import-Csv .\sources.csv | Where-Object { $_.license -in @('IBO-restricted','publisher-copyright') }).Count
(Import-Csv .\sources.csv | Where-Object { -not $_.license }).Count
Get-ChildItem -Recurse -File . | Where-Object { $_.FullName -notlike '*\build\*' -and $_.Extension -match '^\.(pdf|docx|doc|pptx|ppt|xlsx|xls|zip|rar|7z)$' }
```

3. 判定：许可空值数必须为 0；案例目录内（`build/` 之外）原件数必须为 0；受限来源按设计允许登记，但必须写明用途且不得入库原文。
4. 记录：来源总数、一手已核验数、受限数、原件数、许可空值数。

**I5 跨情境移植成本**

1. 选 3 个不同情境，学段、学科、语言各不同。
2. 每个情境从 `teaching_material_init(directory=...)` 开始，填最小真实数据到 `teaching_material_gate` 无 fail，记录修改的文件数与人工计时。
3. 判定：单情境不超过 1 人日；超过就记录卡在哪一层（字段、来源获取、人工证据）。
4. 记录：3 个情境的文件数、耗时、卡点。

以上测法只用案例目录内文件；`pilot.csv` 只放聚合统计，不放学生个人信息。

### 5.3 竞品弱在哪

- OpenMAIC：强在生成与课堂体验，一课可以从主题直接生成到可播放课堂；弱在证据与合规产物。公开文档没有来源登记、门禁报告、哈希清单、版权审计四类产物的说明，知识库是“保存并复用材料”，不是“逐条核验材料”。
- MagicSchool：强在教师工具数量与工作流覆盖，教案、量规、测验、分层、反馈都在一个账号里；弱在“可核验”。公开帮助中心讲的是工具能做什么，没有讲产出如何被第三方复核，也没有产物版本与哈希。
- HaiMate：强在把备课、课堂复盘、成绩分析串成一个对话入口；弱在公开信息只有媒体报道，没有产品文档、没有来源与版权机制说明，连功能细节都只能按报道转述（L32、L33）。
- 共同点：三家的竞争力指标是速度、工具数量、用户规模；我们的指标是证据是否落地、能否复现、是否合规。两套指标不能互相替代，也不该混着比。

### 5.4 对等性限制

以上比较是“公开产物是否存在、能否被独立复核”的结构性比较，不是同课同卷的对照实验。没有 A/B 数据，就不能说我们的物料教得更好。可以说的只有一句：在同样一份案例上，我们的产出可以被逐条核验，竞品的公开材料里找不到对应的核验产物。这条结论以 2026-11-07 的公开文档为限，竞品内部可能另有实现，未核验。

## 6. 未验证清单

1. openmaic.io 为何在 2026-11-07 仍写 AGPL-3.0。仓库 v0.3.0 记 2026-06-28 改为 MIT；官网未同步的原因未见官方说明，本文的“官网滞后”是两处原文对比所得，不是官方承认。
2. OpenMAIC 与清华 MAIC 平台的关系。两者缩写相同、都由清华团队建设，但 MAIC 页面未提 OpenMAIC，OpenMAIC 页面未提 MAIC 平台；是否同一系统的开源版本，未验证。
3. JCST 论文的作者单位、实验设计、数据与结论。只取到标题与 DOI，正文未读，卷期页码未取得。
4. “答题正确率从 80% 提到 95%”的测量方法、样本、题量与对照条件。报道未披露，本文只按报道记录，不作为独立实验证据。
5. 单盲试验的样本量、盲法细节、评分者一致性、统计量。报道未披露。
6. 451 门课程中“备课助手”的具体功能与输出物。官方页面只列名称，没有功能页或文档。
7. 清华 AI 助教系统是否对外开放。报道只描述校内课程试点，未见开放说明。
8. “清小搭”的功能细节。官方页面只有一句描述，未取得产品文档。
9. HaiMate 的功能细节与发布时间口径。只有媒体报道；央广网页面编码异常，正文未可靠读取。
10. MagicSchool 是否具备来源溯源或证据门禁。帮助中心未提，不能据此断言没有；未核验其全部功能。
11. OpenMAIC 是否具备许可检测或版权审计。README 与官网未提，未核验其全部代码。
12. OpenMAIC 官网与仓库的技术栈差异（LangGraph 与 Pi director loop、Vercel 与常驻进程、28+ 动作与 21 种 action）如何对应。只核验到差异存在，未核验原因与当前实际实现。
13. 本插件 0.2.2 的安装态与端到端验收。源码、测试与本会话工具表已核验（L42、L43、L44）；安装清单、真实案例跑通结果由独立验收任务负责，本文写作时尚未读到验收报告。
14. 清华 AI 助教是否使用了《清华大学人工智能教育应用指导原则》约束物料版权。两份材料未见互相引用。
15. `teaching_material_ground`、`teaching_material_outline`、`knowledge.csv` 与 E3-pilot 检查在真实教学案例上的表现。测试夹具覆盖了失败与未执行分支，但没有真实教学数据；教师是否会填 claims.csv 与 knowledge.csv、outline 是否够排版用，均未验证。
16. 本文剩余建议（M1 到 M8）的字段设计未做可用性测试。工作量是估算，没有实测记录；字段数量会不会造成负担，需要一轮真实案例才知道。
17. `E3-pilot` 判断设计文件是否齐全时用中文关键词（研究问题、盲法、样本量、主要指标），英文写或改写表述可能误判为缺设计。是否要改成多语言关键词或结构化字段，未验证。

## 7. 复核方式

- 网页事实：按下表 URL 重取页面，页面日期与访问日期已在第 1 节逐条给出。二手页面（央广网）标注了编码问题。
- 本地事实：按 `文件:行` 重读。行号对应 2026-11-07 的 0.2.2 源码，源码若继续改动，行号可能位移，以函数名与字段名为准。
- 语言规范自查（本机可跑）：

```bash
node --input-type=module -e "import {auditLanguage} from './lib/gate.js'; import {readFileSync} from 'node:fs'; const r = auditLanguage(readFileSync('docs/TSINGHUA-INTEGRATION.md','utf8')); console.log(JSON.stringify(r, null, 2))"
```

  在插件根目录运行，输出空数组表示 0 违例。本文定稿前运行，输出 `[]`，即 0 违例。

- 本插件门禁口径以 `lib/gate.js` 为准；本文的“pass、fail、skip”用法与源码一致，skip 表示未执行，不算通过。

## 附录 A：证据 URL 清单

- https://api.github.com/repos/THU-MAIC/OpenMAIC
- https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/LICENSE
- https://raw.githubusercontent.com/THU-MAIC/OpenMAIC/main/README.md
- https://openmaic.io/zh/openmaic-open-source-education.html
- https://openmaic.io/zh/openmaic-ai-interactive-classroom.html
- https://openmaic.io/zh/openmaic-online-course-generator.html
- https://openmaic.io/zh/openmaic-ai-teacher-assistant.html
- https://openmaic.io/zh/openmaic-pptx-export-tool.html
- https://jcst.ict.ac.cn/en/article/doi/10.1007/s11390-025-6000-0
- https://www.tsinghua.edu.cn/info/1182/110370.htm
- https://www.tsinghua.edu.cn/info/3177/118143.htm
- https://learning.tsinghua.edu.cn/info/1273/2021.htm
- https://help.magicschool.ai/en/articles/16738030-student-tools-teacher-tools-overview
- https://www.stdaily.com/web/gdxw/2026-10/28/content_604250.html
- https://zj.cnr.cn/qxkx/20261030/t20261030_527858052.shtml
