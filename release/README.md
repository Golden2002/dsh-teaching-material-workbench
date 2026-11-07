# Release 0.2.4

- 包：`dsh-teaching-material-workbench-0.2.4.tgz`
- 校验：`SHA256SUMS`
- 社区索引模板：`index.json`（git 源，commit 固定）
- 安装：

```powershell
plugin_manager action=install_bundle target=git+https://github.com/Golden2002/dsh-teaching-material-workbench.git#7b805288da07a1985157948f35feb940179bb384
```

## 验收数据

| 项 | 值 |
|---|---|
| 测试 | `node --test tests/*.test.js` 22 项通过、0 失败 |
| 工具 | 7 个（init/gate/ground/outline/audit/repro/standards） |
| 门禁 | 15 项；验收案例 12 通过 / 0 失败 / 3 未执行 |
| 索引校验 | 官方 `parseMarketIndex` 通过 |
| 安装 | `application=applied`，版本 0.2.4 |

## 公开状态

- 仓库：<https://github.com/Golden2002/dsh-teaching-material-workbench>
- 发布提交：`7b805288da07a1985157948f35feb940179bb384`，tag `v0.2.4`
- 社区目录：fork 分支已含条目文件；PR 需手动点一次 compare 链接（见 `../PUBLISHING.md`）
- npm：未发布（本机无 npm 登录，社区目录不依赖 npm）
