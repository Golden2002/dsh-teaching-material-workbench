# 与同类产品的可复核对比

> 目的：回答"凭什么说在物料制作能力上超过同类产品"。
> 方法：比较**公开可见的能力结构与可复核产物**，不是教学效果的 A/B 对照。教学效果需要真实学习者数据，本仓库没有，也不宣称。
> 时点：2026-11-07。本插件版本 0.2.2。

## 1. 对比对象与证据状态

| 对象 | 类型 | 证据状态 |
|---|---|---|
| OpenMAIC（THU-MAIC） | 开源多智能体课堂/课程生成平台 | 仓库 MIT（LICENSE 原文与 API 一致），官网仍写 AGPL-3.0；功能与许可细节见 `docs/TSINGHUA-INTEGRATION.md` |
| 清华大学 AI 助教 | 课程级知识库问答与写作反馈 | 清华新闻网 2024-03-27 报道；效果数字为团队口径，未独立复核 |
| MagicSchool | 商业 AI 教师工具平台 | 官网自述 80+ 工具；未取得独立评估 |
| 海亮 HaiMate | 商业教师 AI 工作台 | 新华网 2026-11-01 报道；功能为媒体口径 |
| 本插件 | DSH Host 插件 | 本仓库源码、测试、门禁报告与哈希可复核 |

## 2. 能力结构对比

| 能力 | OpenMAIC | 清华 AI 助教 | MagicSchool | HaiMate | 本插件 |
|---|---|---|---|---|---|
| 课程/课件生成 | 有（平台内生成） | 课程知识库问答 | 有 | 有 | 只生成结构化大纲，排版交给外部工具（分工） |
| claim 级来源接地 | 未公开 | 知识库检索增强，未见 claim 台账 | 未公开 | 未公开 | `claims.csv` + `E2-grounding`，unsupported 直接失败 |
| 概念级知识库定位 | 未公开 | 有知识库与知识图谱口径 | 未公开 | 未公开 | `knowledge.csv` + `E2-knowledge`（可选） |
| 分层门禁报告 | 未公开 | 无 | 无 | 无 | `gate-report.md`，每条带层级与依据 |
| 官方评分标准对照 | 未公开 | 无 | 无 | 无 | `E2-rubric-source`；未取得时只能 skip |
| 可及性条款级检查 | 未公开 | 未公开 | 未公开 | 未公开 | WCAG 2.2 对比度/替代文本 + 中英语言规范 |
| 版权/许可审计 | 未公开 | 报道提到投喂材料版权问题 | 未公开 | 未公开 | `rights-report.md` + 案例目录原件扫描 |
| 可复现哈希 | 未公开 | 无 | 无 | 无 | `verification/repro.json` |
| 跨学科/跨场景 | 平台通用 | 课程级 | 学校 | 学校 | 情境档案绑定；两个不同场景案例 |
| 开放与离线 | 开源、可自托管 | 校内 | 闭源云 | 闭源云 | MIT、零依赖、无网络、无遥测 |

说明：
- 表内"未公开"表示公开材料没有给出可复核的对应产物，不等于对方做不到；这是**公开证据的比较**，不是能力断言。
- 本插件不重复做课程生成平台。OpenMAIC 的平台能力是它的强项，本插件把"生成之后怎么验、怎么留证"做成可执行门禁。

## 3. 三项主指标的测法与当前值

### I1 证据链定位覆盖率

定义：`claims.csv` 行数 N，其中 `source_id` 与 `locator` 非空、`status=supported` 的行数为 M；要求 `unsupported=0`，teacher-pack 至少 1 个 `[Sxx]` 标记。

当前样本：
- `verification/lead-smoke`：2 条结论，2 条 supported，覆盖率 100%，标记 3 处；
- `verification/case-acceptance`：3 条结论，2 条 supported、1 条 partial，覆盖率 66.7%，标记 5 处；无 unsupported。

复算：`teaching_material_ground`，或读 `verification/grounding-report.md`。

### I2 可复现哈希一致率

定义：对同一案例连续两次运行 `teaching_material_repro`，比较 `repro.json` 的 `artifacts[].sha256` 序列。

当前样本（2026-11-07）：

| 案例 | 产物数 | 两次哈希一致 |
|---|---:|---|
| lead-smoke | 3 | 是 |
| case-acceptance | 4 | 是 |

限制：这是一次进程内的重复哈希，不等于跨机器重建一致。跨机器一致性需要重跑构建脚本后比对，尚未执行。

### I3 E3 真实性

定义：`gate-report.md` 中 E3 行判 pass 时，必须同时存在 `verification/peer-review.md`、`verification/pilot.csv`、`verification/trial-design.md`，且 pilot 的 `value/n` 已填；否则只能是 skip 或 fail。

当前样本：两个案例都没有人工评审与试点数据，E3 两行均为 skip，没有被误判为 pass。复算：`teaching_material_gate`。

### I4 版权合规

定义：受限来源全部登记；案例目录（`build/` 之外）原始材料文件数为 0；`license` 空值数为 0。

当前样本：
- lead-smoke：受限来源 1 条（S02 publisher-copyright），案例目录原件 0，license 空值 0；
- case-acceptance：受限来源 0，案例目录原件 0，license 空值 0。

复算：`teaching_material_audit`，或读 `verification/rights-report.md`。

## 4. 测试与可安装性

- `node --test tests/*.test.js`：21 项通过，0 失败（YAML/CSV 解析、对比度、语言规则、门禁正反例、工具 schema、manifest、索引格式、试点设计规则）。
- 安装：`plugin_manager install_bundle` 返回 `application=applied`，版本 0.2.2；无安装脚本、无网络。
- 工具：7 个（init、gate、ground、outline、audit、repro、standards）。

## 5. 明确不宣称的

- 不宣称"教得更好"：没有真实学习者对照数据。
- 不宣称"覆盖所有学科"：只有两个不同场景的样例证明核心与学科无关，不代表每个学科都验证过。
- 不宣称"比 OpenMAIC 功能多"：平台能力不在同一维度；本插件的差异是证据链与验证门禁。
- 不宣称"AI 生成即正确"：生成物必须过门禁；门禁未执行的项如实记录为 skip。

## 6. 复算命令

```powershell
cd D:\团聚体\桌面\英语教学\我的学习\plugins\dsh-teaching-material-workbench
node --test tests/*.test.js
```

```text
teaching_material_gate    directory=<案例绝对路径>
teaching_material_ground  directory=<案例绝对路径>
teaching_material_audit   directory=<案例绝对路径>
teaching_material_repro   directory=<案例绝对路径>
```
