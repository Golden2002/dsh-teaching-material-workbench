# 最终安装检查（Lead，0.2.3）

生成时间：2026-11-07 15:00（Asia/Shanghai）
验收对象：`dsh-teaching-material-workbench` **0.2.3**

## 1. 安装事实

| 项 | 值 | 证据 |
|---|---|---|
| 安装命令 | `plugin_manager install_bundle` → `application=applied` | 返回 `"version":"0.2.3"` |
| 安装日志 | `.plugin-manager\logs\operation-fyD14p\pnpm.log` | `- 0.2.2` → `+ 0.2.3` |
| tgz | `dsh-teaching-material-workbench-0.2.3.tgz`，77,993 B | SHA-256 `511DB41EC6495CEC6C76AA78453FC2EEC41681C66C86A7D74FEB9C2F63FB5F0B` |
| 已安装版本 | 0.2.3 | `~\.dsh\profiles\desktop\node_modules\dsh-teaching-material-workbench\package.json` |
| 已安装目录 | `community/ docs/ lib/ locale/ skills/ tests/` | 目录清单 |
| 索引示例版本 | 0.2.3 | 已安装副本 `community/index.example.json` |

## 2. 与已验收 0.2.2 的差异

0.2.2 的独立验收（`verification/plugin-acceptance.md`）结论为通过：7/7 工具、15 项门禁 12 通过/0 失败/3 未执行、audit/repro 有实际产物、schema 无回归。

0.2.3 只做发布前整改，不改门禁行为：

- `lib/index.js` 头注释 five → seven，并补 ground/outline 两行；
- `lib/gate.js` 的 `checkRights` 格式修正（行为不变）；
- `package.json` 与 `locale/en.json`、`locale/zh.json` 描述补 grounding/knowledge/outline；
- `files` 增加 `tests/`，安装态可执行测试；
- 新增 `tests/core.test.js` 端到端用例，驱动 7 个工具的 `execute`；
- `docs/COMPLIANCE.md` 增加 0.2.x 段落；`docs/BENCHMARK.md`、`docs/REUSE.md`、`docs/COMPLIANCE-REVIEW.md` 入包；`community/index.example.json` 版本改 0.2.3。

因此 0.2.2 的行为验收对 0.2.3 仍成立；本节补做安装态复核。

## 3. 安装态复核（本次实测）

| 检查 | 结果 |
|---|---|
| 安装态测试 | 从已安装目录运行 `node --test tests/*.test.js`：22 项通过，0 失败 |
| 门禁（case-acceptance） | 15 项：12 通过 / 0 失败 / 3 未执行；`E2-knowledge` PASS（4 个概念）；skip 为 E2-rubric-source、E3-human、E3-pilot，原因在 `gate-report.md` 单列 |
| 社区索引版本 | 已安装副本为 0.2.3，与包版本一致 |
| 合规缺口 | 0.2.2 复核的 6 项 PARTIAL 中，5 项已在 0.2.3 源码修复并重新打包；剩余 1 项为 `publishTimestamp` 占位，发布前必须改为真实 Unix 秒 |

## 4. 仍未执行 / 未核验

- 官方 `parseMarketIndex` 未实际执行：该库只在 `app.asar` 内，Node 不能 import；合规复核按源码规则逐条核对并留了 node 校验输出。
- `community/index.example.json` 的 `publishTimestamp` 仍是占位值；发布到社区索引前要替换。
- 无同行评审、无试点数据：两个案例的 E3 均为未执行，未被算作通过。
- 无教学效果对照：`docs/BENCHMARK.md` 只比较公开能力结构，不宣称教得更好。

## 5. 复现

```powershell
# 安装版本与目录
Get-Content "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-teaching-material-workbench\package.json"
# 安装态测试
cd "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-teaching-material-workbench"
node --test tests/*.test.js
# 门禁（对已验收案例）
```

```text
teaching_material_gate directory=D:\团聚体\桌面\英语教学\我的学习\verification\case-acceptance
```
