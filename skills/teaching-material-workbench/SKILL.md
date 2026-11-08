---
name: teaching-material-workbench
description: Evidence-gated production of teaching materials with a Web UI: context profile, primary-source register, claim-level grounding, knowledge map, deterministic outline, PAEG language checks, layered gates (E1/E2/E3), rights audit, reproducibility. Use when creating or reviewing a lesson, handout, deck, or teacher pack.
---

# 教学物料制作工作台

把"从一手材料到可直接上课的课件、讲义、教师实施包"做成可检查的流程。适用于任何学科、学段、学习者群体，也适用于学校教育以外的培训场景。

## 先分清两类材料

- **工作台材料**：标准原文、质量框架、工具文档、同类产品资料。它们决定"怎么做、怎么验"。
- **单次物料材料**：考纲、试卷、教材、任务书、学情数据。它们只作为这次制作的输入。

案例目录里只放单次物料的数据与产物。受版权保护的原文不入库，只记页码、条款号与转述。

## 流程

1. **建案例**：调用 `teaching_material_init`，传绝对路径与学科、学段、学习者、场景。得到 `profile.yml`、`lesson.yml`、七个 CSV、`palette.json`、`teacher-pack.md` 与验证模板。
2. **绑定权威**：在 `profile.yml` 的 `authorities` 里写本情境要用的权威文件，并在 `sources.csv` 登记发布方、日期、定位、获取方式、许可、核验状态。
3. **做接地**：在 `claims.csv` 逐条写"结论 → 来源 → 定位 → status"；status 只写 supported、partial、unsupported。然后调用 `teaching_material_ground`，unsupported 必须改材料，不能留。可选：在 `knowledge.csv` 登记关键概念到来源与定位，`E2-knowledge` 会检查。
4. **写目标与评估**：`lesson.yml` 的每条目标可观察；`assessment.total_marks` 与 `rubric.csv` 的合计一致。
5. **做对齐**：`alignment.csv` 每行写目标、教学动作、学生活动、评估方式、材料位置；不得留空。
6. **写时间轴**：`timeline.csv` 分钟粒度，不重叠，合计等于 `duration_min`。
7. **生成大纲**：调用 `teaching_material_outline` 得到 `build/outline.md`；再用你选择的课件工具排版成 `build/deck.pptx` 与 `build/handout.docx`，写 `teacher-pack.md`（引用来源写 [S01]）。
8. **跑门禁**：调用 `teaching_material_gate`。不通过就改数据，不要改判据；`skip` 是"未执行"，不是通过。
9. **版权审计**：调用 `teaching_material_audit`。原始试卷、教材扫描件不得放进案例目录。
10. **记录哈希**：调用 `teaching_material_repro`，把产物哈希写进 `verification/repro.json`；重建后比对。
11. **人工与实证**：把 `verification/peer-review.template.md` 变成 `peer-review.md` 并填至少 3 条意见；有真实学生数据时先写 `verification/trial-design.md`（研究问题、盲法、样本量、主要指标），再填 `pilot.csv` 的 value 与 n。有数据无设计判失败，空模板也判失败。做不到就保留"未执行"。

## Web UI

安装后刷新页面，对话视图旁的 `教学物料` 标签就是工作台，四个页签：

- **逐页**：按时间轴生成页草稿；左侧选页，中间改标题、时长、版面、课件要点、讲义正文、任务、讲稿、来源；右侧 16:9 课件卡与讲义卡。图示可选 `figures.json` 或 `assets/` 图片，填替代文本、图注与图片来源；未接地句子可选来源补 `[Sxx]`。保存写 `pages.json`、重建 `build/outline.md` 并生成 `.history/` 版本。
- **新建案例**：顶栏向导填标题、学科、学段、学习者、场景、时长、评估、初始来源与时间轴，创建后直接打开。
- **来源**：卡片式编辑 `sources.csv`，显示已核验一手/未核验/受限计数。
- **数据文件**：直接改 `lesson.yml`、CSV、`claims.csv`、`knowledge.csv`、`teacher-pack.md`、`build/outline.md` 等。
- **检查中心**：聚合门禁三态、语言违例、claims 接地与来源审计。
- **版本回退**：列出 `.history/` 版本并可恢复；可看当前 `pages.json` 与某版本的并排差异。

界面只读写你传入的案例目录，且只改允许的文本文件。预览是近似预览，版式以导出文件为准。

## 逐页与导出

- `teaching_material_pages`：`action=get|draft|save|history|restore`。`draft` 从 `timeline.csv` 生成页草稿；`save` 写 `pages.json`（带 revision 乐观锁）并重建大纲；`history`/`restore` 管理 `.history/`。
- `teaching_material_export`：`targets` 取 `handout`、`deck`、`storyboard`、`manim`、`docx`、`pptx` 或 `all`。Markdown 与 Manim 脚本总会生成；DOCX/PPTX 只在宿主机有 Python + python-docx/python-pptx 时生成，缺依赖会返回 `degraded_reason`，不伪装成功。
- Manim 只生成 `animations/Scene*.py` 场景骨架，不执行渲染；渲染交给教师或 CI，命令示例见 `docs/MEDIA-PIPELINE.md`。

## 语言检查

中文教学文本用 `teaching_language_check`（或界面里的“语言检查”）。规则来自 PAEG teaching-language skill（MIT, Golden2002）：违禁词、半角标点、并列加号/斜杠、省略号与“等”、破折号与“即”、层级数字、标题句号、祈使句、第二人称、40 字长句。机械替换只处理可枚举项，之后必须人工终审。学生可见正文放 `language.md`，`E2-language-paeg` 会按同一套规则检查。

## 门禁怎么读

- `E1` 自洽检查：结构、算术、跨文件一致。证明"没算错、没漏项"，不证明"教得好"。
- `E2` 外部标准：来源登记、官方评分标准、WCAG、语言规范、许可。必须写清标准号与条款。
- `E3` 外部实证：同行评审、试点数据。没有就 `skip`。

判定只有三种：`pass`、`fail`、`skip`。`skip` 不得写成通过。每条结论要能指到文件、行号、页码、URL 或 DOI。

## 外部依据

`teaching_material_standards` 返回工作台登记的外部依据：WCAG 2.2、CAST UDL 3.0、QM 高教量表、OSCQR、ISO 24495-1、GB/T 15834、PDF/UA，以及材料开发、词汇覆盖、题目编写、多媒体学习、双评一致性等论文 DOI。状态分 `verified`、`partial`、`not-obtained`；引用前先看状态。

## 常见失败与处置

- **官方 mark scheme 拿不到**：`rubric.csv` 的 `status` 写 `textbook` 或 `self-authored`，`E2-rubric-source` 会记 `skip`。不要写成 official。
- **学生数据拿不到**：`E3-pilot` 记 `skip`，在交付说明里单独列出，不编数据。
- **时间轴超时**：砍可删环节，不压缩练习时间。
- **术语不一致**：以考纲用词为准；教材用词写进备注，不直接替换。
- **案例目录出现原文文件**：删除文件，只保留引用与转述；必要时把原文放案例目录之外。
- **门禁失败**：先判断是数据错还是判据错；判据错要有外部依据才能改，不能为了通过而放宽。

## 交付前检查

- [ ] `teaching_material_gate` 无 `fail`；所有 `skip` 有原因。
- [ ] `teaching_material_audit` 无未登记许可、案例目录无原始材料文件。
- [ ] `teaching_material_repro` 已生成哈希；重建后一致或说明差异。
- [ ] `teacher-pack.md` 的时间轴、板书、备用活动、退出票齐全。
- [ ] 交付说明列出"未验证 / 未执行"项。
