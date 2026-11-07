# 官方社区合规复核（COMPLIANCE REVIEW）

对象：`dsh-teaching-material-workbench` 0.2.2（社区 Host bundle，MIT）。本文件对照 DeepSeek Harness 官方 Host bundle 规范与社区索引格式 1，逐条判定 PASS / PARTIAL / FAIL 并给出可复核证据。判定口径：PASS 表示证据齐全且符合要求；PARTIAL 表示主体符合但有缺口或需在发布前同步；FAIL 表示违反要求。无法核验的项单列，不写成 PASS。本复核不改插件代码、不改 profile、不安装插件。

## 0. 复核快照与方法

复核时间 2026-11-07 14:49—14:58（Asia/Shanghai）。复核期间包从 0.2.0 升到 0.2.2，最终以工作区 0.2.2 与已安装 0.2.2 为准。

| 文件 | 大小（B） | mtime | SHA-256 前 16 位 |
|---|---|---|---|
| `package.json` | 1,061 | 11-07 14:49:17 | `514E97216EC05001` |
| `CHANGELOG.md` | 2,271 | 11-07 14:49:18 | `E54EC39B14CB4D75` |
| `README.md` | 5,038 | 11-07 14:49:28 | `B1D1BB8E91157B5A` |
| `lib/index.js` | 20,786 | 11-07 14:49:08 | `08DB9F8CAC334AF0` |
| `lib/gate.js` | 35,427 | 11-07 14:49:08 | `BDF902F05E5C593B` |
| `lib/outline.js` | 4,362 | 11-07 14:47:37 | `5FA437F0171C74BA` |
| `lib/templates.js` | 7,027 | 11-07 14:49:00 | `D3993D97A8AB73CE` |
| `lib/standards.js` | 6,558 | 11-07 14:28:01 | `5CC5BCA436032D26` |
| `tests/core.test.js` | 14,454 | 11-07 14:49:17 | `A19B1A0034A18FAF` |
| `skills/teaching-material-workbench/SKILL.md` | 4,961 | 11-07 14:49:28 | `EFAA347EDCBEC22A` |
| `community/index.example.json` | 1,403 | 11-07 14:50:08 | `E5E711175F795CD7` |
| `docs/COMPLIANCE.md` | 3,798（0.2.2 tgz 内；0.2.3 工作区为 5,140，哈希 `CD240050884E1B83`） | 11-07 14:30:10 | `F6CC994796C26477` |
| `docs/TSINGHUA-INTEGRATION.md` | 47,130 | 11-07 14:50:20 | `0BED94D25E7554F0` |
| `locale/en.json` | 236 | 11-07 14:26:55 | `F1B4F18580B0C73F` |
| `locale/zh.json` | 230 | 11-07 14:26:55 | `A1DFABBBD291D0E1` |
| `icon.svg` | 531 | 11-07 14:27:04 | `A0B69CCE56E6B3E0` |
| `cordis.patch.yml` | 294 | 11-07 14:26:55 | `D1E5AF88697196A1` |
| `dsh-teaching-material-workbench-0.2.2.tgz` | 51,234 | 11-07 14:49:37 | `DA9F0D78CDDE4684` |

版本与安装态：

- 工作区 `package.json:3` 为 `0.2.2`；`CHANGELOG.md:3-7` 有 0.2.2 条目。
- 已安装副本 `C:\Users\团聚体\.dsh\profiles\desktop\node_modules\dsh-teaching-material-workbench` 为 0.2.2。
- profile 依赖与 bundles：`C:\Users\团聚体\.dsh\profiles\desktop\package.json:13` 为 `file:...dsh-teaching-material-workbench-0.2.2.tgz`；`:17` 的 `bundles` 数组第 23 行含本包。
- 运行环境：app.asar 内 `@deepseek-ai/dsh` 为 0.2.2-rc.1（`app.asar/dsh/node_modules/@deepseek-ai/dsh/package.json:4`）。
- 复核方法：`read` 读源码行号、`node --test` 跑测试、`tar -tzf` 与解包哈希比对打包物、`cordis_inspect_query` 读 Host 服务契约与已装插件条目、`node` 脚本按校验器源码正则复核索引字段、`web_fetch` 复核两条外部标准、`grep` 式检索核对网络与命令调用。

复核后状态：工作区源码在复核期间继续升到 0.2.3（`package.json` mtime 14:54:02、SHA-256 前缀 `36EA6DB43435C76A`），并已针对本报告的 6 项 PARTIAL 做修复：`files` 加入 `tests/`、新增端到端 execute 用例、`lib/index.js` 头注释改为 seven tools、`docs/COMPLIANCE.md` 更新到 0.2.x 口径、`community/index.example.json` 改为 0.2.3、描述与 locale 同步。0.2.3 的 `node --test` 为 22 项通过。但截至本报告完成，tgz 仍为 0.2.2（`DA9F0D78CDDE4684`，14:49:37），已安装副本仍为 0.2.2，未见 0.2.3 的打包物。因此第 2 节的判定仍按已安装的 0.2.2 记录，0.2.3 的修复列为“源码已修复、待重新打包复核”，不提前记 PASS；发布前重新打包并按 C15—C20 复核一次即可。

## 1. 结论摘要

共 21 项：**PASS 15 项，PARTIAL 6 项，FAIL 0 项**。

- 主体合规：bundle manifest、Host 导出形态、技能注册、双语显示元数据、图标、`exports`/`files`、`engines.dsh`、无网络无遥测、测试通过、tool schema 校验、README/CHANGELOG/LICENSE、社区索引结构、安装态运行证据，全部 PASS。
- 需要发布前处理（PARTIAL）：打包物与工作区不同步（索引示例 0.1.0、`docs/TSINGHUA-INTEGRATION.md` 旧版、`tests/` 与 `verification/` 未打包）；README 的测试命令在打包/安装态不可执行；`docs/COMPLIANCE.md` 未随 0.2.x 更新；`lib/index.js:4` 注释仍写“五个工具”；新增工具缺少对 `execute` 的直接测试。
- 关键缺口（发布前必须处理）：0.2.2 的 tgz 内 `community/index.example.json` 版本仍是 0.1.0，若直接从该 tgz 取文件提交社区索引，会登记错误版本；重新打包并复核 `parseMarketIndex` 后才能提交。0.2.3 工作区已修复这一处并补齐 tests 入包、注释、COMPLIANCE.md 与端到端测试，但尚未打包，故仍按 PARTIAL 记录。

## 2. 逐项判定

| 编号 | 检查项 | 判定 | 证据 | 修复建议 |
|---|---|---|---|---|
| C1 | bundle manifest：`name`/`version`/`dsh.bundle.patch` | PASS | `package.json:2-3`、`:44-48`；`cordis.patch.yml:4-6` 插入一行 `id: teaching-material-workbench`、`name: dsh-teaching-material-workbench` | 无 |
| C2 | 无 `postinstall`/`prepare`、无构建、零运行时依赖 | PASS | `package.json:25-27` 只有 `test`；无 `dependencies`/`devDependencies`；`lib/` 直接发 ESM | 无 |
| C3 | Host export：`apply`/`inject`/`ctx.effect` | PASS | `lib/index.js:516-517`（`name`、`inject = ['tools']`）、`:523-541`（`apply`）、`:526`（工具 `ctx.effect` 注册）；Host `tools` 服务契约为 `register(definition, options): () => void` | 无 |
| C4 | 运行时技能注册与降级 | PASS | `lib/index.js:528-540`：`ctx.get('skills')` 判空后 `register({name, description, content, source: 'bundled', invocation})`；Host `skills` 服务契约存在 `register(skill: SkillRegistration): () => void`，`SkillSource` 含 `bundled` | 无 |
| C5 | 双语显示元数据 | PASS | `locale/en.json:1-5`、`locale/zh.json:1-5` 都有 `meta.title`、`meta.description`；英文标题句首大写 | 无 |
| C6 | 图标：原创声明、在包内、大小与格式 | PASS | `icon.svg` 531 B，SVG 可解析（根元素 `svg`，`viewBox 0 0 128 128`），无外部引用；`docs/COMPLIANCE.md:23` 声明为本包原创；`package.json:10` 导出 `./icon`，`:17` 的 `files` 含 `icon.svg`；0.2.2 的 tgz 内含 `package/icon.svg` | 原创性无法独立核验，见第 11 节；声明已足 |
| C7 | `exports` 覆盖入口、locale、图标、清单 | PASS | `package.json:7-12`：`.`、`./locale/*.json`、`./icon`、`./package.json` | 无 |
| C8 | `files` 覆盖全部运行时文件 | PASS | `package.json:13-24` 含 `lib/`、`skills/`、`locale/*.json`、`icon.svg`、`cordis.patch.yml`、`community/`、`docs/`、`README.md`、`CHANGELOG.md`、`LICENSE`；`lib/outline.js` 由 `lib/` 覆盖；解包核对 tgz 内 20 个条目齐全 | 无 |
| C9 | `engines.dsh` 兼容 | PASS | `package.json:28-31` 为 `>=0.2.2-rc.1`；`semver.satisfies('0.2.2-rc.1', range) === true`；运行中的 app.asar 为 0.2.2-rc.1 | CLI 风险见第 1 节注：PATH 上的 `dsh` 为 0.2.0-rc.1，用它安装会被 engines 拦下，发布说明里写明最低版本 |
| C10 | 无网络、无遥测、隐私 | PASS | `lib/*.js` 检索 `fetch(`、`node:http`、`node:https`、`node:net`、`child_process`、`process.env`、`eval(`、`new Function`、`require(` 均无命中；`lib/standards.js` 只有 `url` 数据字段；`README.md:70` 写明不收集学生数据；插件只读写用户传入的案例目录 | 无 |
| C11 | 测试通过 | PASS | `node --test tests/*.test.js`：tests 21、pass 21、fail 0、duration 约 2.2 s，Node v25.5.0（0.2.2 快照复跑；0.2.3 复跑为 22 项，含端到端 execute 用例） | 无 |
| C12 | tool schema 校验 | PASS | `lib/index.js:496-514` 的 `assertToolSchema`，激活期对 7 个工具逐个校验；`tests/core.test.js:385-401` 断言全部工具通过并拒绝属性级 `required`；0.1.1 缺陷修复见 `CHANGELOG.md:24-28` | 无 |
| C13 | README/CHANGELOG/LICENSE | PASS | `README.md:9-17` 列 7 个工具，`:45-48` 写大纲与试点设计流程；`CHANGELOG.md:3-22` 有 0.2.2/0.2.1/0.2.0 条目；`LICENSE` 1,101 B 为 MIT | 无 |
| C14 | 社区索引格式 1 必填项 | PASS | 工作区 `community/index.example.json`：`format: 1`、index 级 `title.en` 非空、`plugins[0].name` 为合法 npm 包名、`versions` 非空、`version` 为精确 SemVer、`publishTimestamp` 为整数、`source.type` 为 `npm`、`engines.dsh` 为合法 SemVer 范围；按校验器源码逐条核对，见第 7 节 | 无 |
| C15 | 社区索引版本与当前包一致 | PARTIAL | 0.2.2 工作区示例 `:39` 为 `0.2.2`，但 0.2.2 的 tgz 内该文件仍为 `0.1.0`（`tar -xOzf` 读取）；两份都不含真实发布时间。0.2.3 工作区示例已改到 `0.2.3`，待打包 | 重新打包；提交前把 `publishTimestamp` 改成真实 Unix 秒，并用 `parseMarketIndex` 校验 |
| C16 | 打包物与工作区一致 | PARTIAL | 0.2.2 解包比对：`lib/*`、`README.md`、`CHANGELOG.md`、`locale/*`、`icon.svg`、`cordis.patch.yml`、`skills/.../SKILL.md` 哈希一致；`community/index.example.json` 不同（tgz 为 0.1.0）；`docs/TSINGHUA-INTEGRATION.md` 不同（tgz 为 14:48 版本）；`tests/core.test.js`、`verification/plugin-acceptance.md` 未打包。0.2.3 的 `files` 含 `tests/`，`docs/COMPLIANCE.md`、locale、索引示例均已更新，但尚未打包 | 重新打包后再比对一次；`verification/` 是否入包需写明决定 |
| C17 | README 的验证命令在打包/安装态可执行 | PARTIAL | 0.2.2 快照：`README.md:60-64` 写 `node --test tests/*.test.js`，但 `package.json:13-24` 的 `files` 不含 `tests/`，tgz 与已安装副本都没有 `tests/` 目录（安装副本目录清单已核）。0.2.3 的 `files` 已含 `tests/`，待打包复核 | 0.2.3 已选“把 `tests/` 加入 `files`”，重新打包后按本项复核 |
| C18 | `docs/COMPLIANCE.md` 与当前版本同步 | PARTIAL | 0.2.2 的 tgz 内是 3,798 B 的旧版（只覆盖 0.1.x 的五个工具与测试描述）；工作区在 14:54:29 更新为 5,140 B（`CD240050884E1B83`），新增第 10 节“0.2.x additions”，列 7 个工具、接地、知识库、大纲、试点设计、来源角色与 `tests/` 入包 | 重新打包后即可与源码一致，无需再改文档 |
| C19 | 源码注释与实现同步 | PARTIAL | 0.2.2 快照 `lib/index.js:4` 仍写 “Registers five tools and one runtime skill”，实际 `lib/index.js:486` 的 `TOOLS` 有 7 个；0.2.3 已改为 “Registers seven tools” | 重新打包后复核 |
| C20 | 新增功能的测试覆盖 | PARTIAL | 0.2.2 的 21 项测试覆盖 YAML/CSV、对比度、语言规则、完整案例、`E2-grounding`/`E2-knowledge`/`E3-pilot` 失败分支、大纲生成、manifest、索引示例、tool schema；7 个工具的 `execute` 没有直接调用测试，也缺跨工具端到端用例。0.2.3 新增 `tests/core.test.js:350` 的端到端用例，逐个驱动 7 个 `execute`，测试总数 22 项通过 | 重新打包后按 22 项复核 |
| C21 | 安装态运行证据 | PASS | 已安装副本 0.2.2；`cordis_inspect_query` 的 Host `Config.listConfigs` 返回条目 `{id: include:teaching-material-workbench, name: dsh-teaching-material-workbench, status: absent}`（无 `Config` 声明属允许情形）；本会话工具表可见 7 个 `teaching_material_*` 工具；本会话技能目录含 `teaching-material-workbench`，描述与 `SKILL.md:3` 一致（含 knowledge map） | 端到端验收由独立任务负责，本项只证明安装行、工具与技能已生效 |

## 3. bundle manifest 与安装脚本

- `package.json:2` 包名 `dsh-teaching-material-workbench`，是合法 npm 包名（校验器正则 `PACKAGE_NAME`：`@deepseek-ai/dsh-plugin-market-index/lib/index.js:24`）。
- `package.json:3` 版本 `0.2.2`，与 `CHANGELOG.md:3`、已安装副本、tgz 内 `package/package.json` 一致。
- `package.json:44-48` 的 `dsh.bundle.patch` 指向 `./cordis.patch.yml`，文件存在（294 B）。
- `cordis.patch.yml:1-6` 只有一条 `insert`，行 id 与包名唯一；注释说明安装走 `plugin_manager`/`dsh plugin add`，不手工改 profile，与 `cordis-plugin-development/SKILL.md:8-10`、`host-plugin.md:79-83` 一致。
- 安装脚本：`package.json:25-27` 只有 `test`，无 `postinstall`、`prepare`、`prepublish`；无 `build` 脚本；`files` 内的 JS 是成品 ESM，激活时直接 `import`，无编译步骤。

## 4. Host 导出与注册

- 导出形态是单函数 `apply(ctx)`，没有默认导出，也没有 `Config`：`lib/index.js:516-541`。`host-plugin.md:57-64` 允许这种形态。
- `inject = ['tools']`（`lib/index.js:517`），与 Host `tools` 服务键一致；`cordis_inspect_query` 读到的 `tools.register` 签名是 `register(definition: ToolDefinition, options?: ToolRegistrationOptions): () => void`，本包的 `ctx.effect(() => ctx.tools.register(tool), label)` 正好把 disposer 交给 `ctx.effect`。
- 技能注册是可选依赖：`const skills = ctx.get('skills')`，缺服务时跳过（`lib/index.js:528-529`），符合 `host-plugin.md` 对可选服务的写法要求。Host `skills` 服务契约确认 `register(skill: SkillRegistration): () => void` 与 `SkillSource` 含 `bundled`，本包 `source: 'bundled'` 合法。
- 7 个工具：`teaching_material_init`、`gate`、`audit`、`repro`、`ground`、`outline`、`standards`，集中定义在 `lib/index.js:486`。每个工具的 `parameters` 顶层是 `type: object` 且 `required` 是数组；`assertToolSchema`（`:496-514`）在激活期复检，防止 0.1.1 那类属性级布尔 `required` 回归。

## 5. 显示元数据与图标

- 英文 `locale/en.json`：`meta.title = "Teaching material workbench"`，`meta.description` 描述能力（证据链生产、门禁、版权审计、哈希），符合 `host-plugin.md:33` 对“可识别标题 + 能力描述 + 句首大写”的要求。
- 中文 `locale/zh.json`：`meta.title = "教学物料制作工作台"`，`meta.description` 与英文同义。
- `package.json:7-12` 导出 `./locale/*.json` 与 `./icon`；`package.json:13-24` 的 `files` 收齐。`host-plugin.md:35-36` 要求发布前核对实际打包清单：0.2.2 tgz 解包后确实含 `package/locale/en.json`、`package/locale/zh.json`、`package/icon.svg`。
- 图标：531 B，低于 256 KiB 上限；`icon.svg` 为 `viewBox 0 0 128 128` 的纯路径 SVG，无外部 `href`；`docs/COMPLIANCE.md:23` 声明原创、随包 MIT 发布。原创身份无法独立核验，但无第三方素材痕迹，风险低。

## 6. 打包与分发

`tar -tzf dsh-teaching-material-workbench-0.2.2.tgz` 的 20 个条目：`LICENSE`、`lib/` 7 个文件、`locale/en.json`、`locale/zh.json`、`community/index.example.json`、`community/README.md`、`package.json`、`CHANGELOG.md`、`docs/COMPLIANCE.md`、`docs/TSINGHUA-INTEGRATION.md`、`README.md`、`skills/teaching-material-workbench/SKILL.md`、`icon.svg`、`cordis.patch.yml`。

- 解包后与工作区逐文件比对：一致的有 `lib/*`（7 个）、`README.md`、`CHANGELOG.md`、`LICENSE`、`locale/*`、`icon.svg`、`cordis.patch.yml`、`docs/COMPLIANCE.md`、`community/README.md`、`skills/.../SKILL.md`。
- 不一致的有 3 个：`package.json`（哈希不同；0.2.0 时比对为 npm 打包的末尾换行差异，本次未逐行复核）、`community/index.example.json`（tgz 内 `0.1.0`，工作区 `0.2.2`）、`docs/TSINGHUA-INTEGRATION.md`（tgz 为 14:48 版本，工作区为 14:50:20 版本）。
- 未打包的运行时无关文件：`tests/core.test.js`（被 `files` 排除）、`verification/plugin-acceptance.md`（验收证据，由另一任务产生）、`docs/REUSE.md` 与本文件（写入时间晚于 14:49:37 的打包）。
- 已安装副本目录没有 `tests/`；`docs/` 下有 `COMPLIANCE.md` 与 `TSINGHUA-INTEGRATION.md`；索引示例为 tgz 内版本（0.1.0）。安装来源是 profile `package.json:13` 的 `file:` 依赖，不是本地目录链接，所以 `files` 的过滤生效。

## 7. 社区索引格式 1

对照 `@deepseek-ai/dsh-plugin-market-index/lib/index.js` 的 `parseMarketIndex`（`:280-303`）逐条核对工作区 `community/index.example.json`：

| 校验器规则 | 源码位置 | 工作区示例 | 结论 |
|---|---|---|---|
| 根对象且 `format === 1` | `:283-284` | `:2` `format: 1` | 通过 |
| 根 `title` 为本地化对象且含 `en` | `:51-61`、`:294` | `:3-6` 含 `en`、`zh` | 通过 |
| 根 `description` 可选，若给须本地化 | `:295` | `:7-10` 含 `en`、`zh` | 通过 |
| `plugins` 为数组且不重名 | `:286-293` | `:16-50` 单条 | 通过 |
| 插件 `name` 为合法 npm 包名（≤214 字符） | `:24`、`:252-253` | `dsh-teaching-material-workbench`（31 字符） | 通过 |
| 插件 `title`/`description` 可选，若给须本地化 | `:254-255` | `:19-26` 含 `en`、`zh` | 通过 |
| `author` 可选，若给须为非空字符串 | `:257` | `:27` 非空 | 通过 |
| `metadata.keywords` 为字符串数组 | `:105-111` | `:28-36` 5 个字符串 | 通过 |
| `versions` 非空数组，版本不重复 | `:239-249` | `:37-48` 单条 | 通过 |
| `version` 为精确 SemVer | `:29`、`:228-229` | `0.2.2` | 通过 |
| `publishTimestamp` 为整数且落在 `[0, 10^11)` | `:230-231` | `1794032400`（= 2026-11-07 06:20:00 UTC，整数合法） | 通过；提交前改成真实发布时间 |
| `source.type` 为 `npm` 或 `git`，npm 带可选 `registry` | `:176-199` | `:41-43` `type: npm` | 通过 |
| `engines.dsh` 为合法 SemVer 范围（禁止 `workspace:`） | `:200-208` | `:44-46` `>=0.2.2-rc.1`；`semver.validRange` 非空，`satisfies('0.2.2-rc.1')` 为真 | 通过 |
| 安装目标可由 `name@version` 组成 | `:311-318` | `dsh-teaching-material-workbench@0.2.2` | （提交后会）通过 |

本地 `node` 脚本按上述正则逐项核对的输出（工作区）：`format1:true`、`titleEn:true`、`pluginNameValid:true`、`versionsNonEmpty:true`、`versionSemVer:true`、`versionInSync:true`（工作区 `0.2.2` 对 `0.2.2`）、`publishTimestampInteger:true`、`sourceType:"npm"`、`enginesValidRange:true`、`runningAppSatisfies:true`、`cli020Satisfies:false`。

缺陷：0.2.2 的 tgz 内同一文件仍是 `version: "0.1.0"`，与包版本不同步。修法：重新打包后再取示例文件提交；若采用 npm 发布，先 `npm publish` 再填真实 `publishTimestamp`。

## 8. 网络、遥测与隐私

- 网络：`lib/*.js` 检索 `fetch(`、`node:http`、`node:https`、`node:net`、`node:dns`、`node:tls`、`XMLHttpRequest` 均无命中；`lib/standards.js` 的 `https://...` 只是登记用的 URL 字符串，不在运行时请求。
- 遥测：无 ID、无上报、无 `process.env` 读取；`README.md:70` 声明无网络、无遥测、不收集学生数据。
- 数据边界：工具只读写参数 `directory` 指向的案例目录（`lib/index.js:119-174` 的脚手架写入、`lib/gate.js:629-651` 的报告写入、`lib/gate.js:728-748` 的哈希写入）；不写 profile，不写插件自身目录，不读凭据。
- 外部调用：插件自身不调用 LLM、不调网络；`office-*` 等技能的 LibreOffice 调用由用户侧 agent 发起，不在本包运行时内。

## 9. 测试与 schema 证据

`node --test tests/*.test.js`（工作区，2026-11-07 复跑）：`tests 21`、`suites 0`、`pass 21`、`fail 0`、`cancelled 0`、`skipped 0`、`duration_ms 2229`。21 项名称（`tests/core.test.js` 行号）：

1. YAML 解析（`:122`）
2. CSV 往返（`:142`）
3. 对比度（`:151`）
4. 语言规则（`:157`）
5. 完整案例通过数据门禁（`:165`，断言 pass 12、skip 3，含 `E2-knowledge`、`E2-grounding`）
6. `E1-rubric-sum` 失败（`:182`）
7. `E2-rubric-source` 失败（`:192`）
8. `E2-rights` 失败（`:202`）
9. `E2-accessibility` 失败（`:213`）
10. `E2-language` 失败（`:225`）
11. `E2-grounding` 失败（`:235`）
12. 缺 `claims.csv` 记未执行（`:248`）
13. 大纲生成（`:260`，断言含“知识库定位”）
14. 过粗定位失败（`:275`）
15. 非法 knowledge 行失败（`:288`）
16. 空试点模板失败（`:301`）
17. 有数据无设计失败（`:314`）
18. 有设计有数据通过（`:328`）
19. bundle manifest 字段（`:350`）
20. 社区索引格式 1（`:373`）
21. 全部 tool schema 通过函数校验器（`:385`）

schema 证据：`lib/index.js:496-514` 的 `assertToolSchema` 检查名称、`parameters.type === 'object'`、对象级 `required` 为数组、`required` 字段都有属性 schema、属性内部不得出现 `required`；第 21 项测试同时用坏样例断言会抛错。0.2.3 工作区为 22 项，新增 `tests/core.test.js:350` 的端到端 execute 用例（逐个驱动 7 个工具）；上述 21 项与行号按 0.2.2 快照。

## 10. 修复建议（按优先级）

P0（发布前必须）：

1. 重新打包：让 tgz 内 `community/index.example.json` 与工作区一致（0.2.2），并包含最新的 `docs/TSINGHUA-INTEGRATION.md` 与本目录新增的两份复核文档。
2. 提交社区索引前，把 `publishTimestamp` 改为真实 Unix 秒，并用官方 `parseMarketIndex` 跑一次（本复核只按源码逐条核对，未实际执行该函数，原因见第 11 节）。
3. 决定 `verification/` 是否入包：若是验收证据，加入 `files`；若只是工作区材料，保持现状并注明。

P1（下一个版本处理）：

4. 修 `lib/index.js:4` 注释（five → seven，补 ground/outline 两行）。
5. 让 README 的测试命令在安装态可执行：把 `tests/` 加入 `files`，或在 `README.md:60-64` 注明测试只在源码仓库运行。
6. 更新或替代 `docs/COMPLIANCE.md`：至少补 0.2.x 的 7 个工具、`knowledge.csv`、`E3-pilot` 强化，避免旧说明和新功能分叉。

P2（质量改进）：

7. 增加工具 `execute` 的直接测试与一次端到端用例（init → ground → gate → repro）。
8. 发布说明写明最低 Harness 版本：`engines.dsh >=0.2.2-rc.1`；PATH 上的 CLI 0.2.0-rc.1 不满足该范围，安装会被 engines 拦下。
9. `publishTimestamp` 与版本号同步的校验可以写成脚本，避免下次再出现 tgz 与工作区版本分叉。

## 11. 未核验项

- 官方 `parseMarketIndex` 未实际执行：该包只存在于 Electron 的 `app.asar` 内，Shell 与 Node 无法 import；本复核用 `read` 读取 `lib/index.js:1-320` 的校验逻辑，再用本地 `node` 脚本按同一组正则复核字段。结论是“按源码规则通过”，不等于“官方函数返回通过”。
- 图标原创性：仅采用 `docs/COMPLIANCE.md:23` 的声明，无法独立核验作者与创作过程；已核验文件格式、大小、位置与无外部引用。
- UDL 3.0、QM 高教量表：沿用项目证据登记表 E04、E06，本轮未联网重抓。
- Tomlinson、Nation、Haladyna 三篇 DOI：沿用证据登记表 E01—E03 的 Crossref 结果，本轮未重跑。
- `docs/TSINGHUA-INTEGRATION.md`：只读了前 22 行与目录页，未逐行核验其事实表；该文件由另一复核任务产出，本复核只判断其打包状态。
- `package.json` 在 tgz 与工作区之间的哈希差异未逐行比对；0.2.0 时同类差异为打包末尾换行，本次未证实。
- 已安装态的端到端功能验收（真实案例跑 7 个工具）由独立验收任务负责，本复核只证明安装行、工具表与技能目录已生效。
- 外部标准页码与条款级核对：GB/T 15834 只核标准页状态，未逐条摘录正文；PDF/UA 正文仍未取得。
