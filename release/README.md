# Release 0.2.4

- 包：`dsh-teaching-material-workbench-0.2.4.tgz`
- 校验：`SHA256SUMS`
- 社区索引模板：`index.json`（版本 0.2.4，真实时间戳，npm 源）
- 安装：

```powershell
plugin_manager action=install_bundle target=<绝对路径>\dsh-teaching-material-workbench-0.2.4.tgz
```

## 验收数据

| 项 | 值 |
|---|---|
| 测试 | `node --test tests/*.test.js` 22 项通过、0 失败 |
| 工具 | 7 个（init/gate/ground/outline/audit/repro/standards） |
| 门禁 | 15 项；验收案例 12 通过 / 0 失败 / 3 未执行 |
| 索引校验 | `node community/validate-index.mjs community/index.example.json` → `ok: true` |
| 安装 | `application=applied`，版本 0.2.4 |

## 公开分发状态

- 源码已推送到 `Golden2002/teaching-material-workflow`（private）的 `plugins/dsh-teaching-material-workbench/`，tag `plugin-v0.2.4`。
- npm 与公开仓库因本机无凭据、仓库为 private，未完成。具体命令见仓库根目录 `PUBLISHING.md`。
