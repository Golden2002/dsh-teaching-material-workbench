# Publishing

当前版本：**0.6.0**（公开仓库已更新；社区目录 PR #12902 已触发 CI 重跑）。

## 1. 公开仓库

| 项 | 值 |
|---|---|
| 仓库 | <https://github.com/Golden2002/dsh-teaching-material-workbench>（public） |
| 默认分支 | `main` |
| 发布 tag | `v0.6.0` |
| tarball | `release/dsh-teaching-material-workbench-0.6.0.tgz`，184,463 B |
| SHA-256 | `CB26F26FDD9EA2265BAEB114D8AD1951B8A5F6C155F5745741399E4EE96AC45E` |
| 安装 | `plugin_manager install_bundle` 返回 `application=applied`，版本 0.6.0，10 个工具 |
| 测试 | 38 项通过、0 失败、0 跳过 |

从公开仓库安装（tag 固定）：

```powershell
plugin_manager action=install_bundle target=git+https://github.com/Golden2002/dsh-teaching-material-workbench.git#v0.6.0
```

## 2. 社区目录

- 目录：`awesome-dsh-plugin/awesome-dsh-plugin`
- PR：<https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/12902>（open）
- 条目文件：`data/plugins/Golden2002__dsh-teaching-material-workbench.yml`（fork 分支 `add-dsh-teaching-material-workbench`）
- CI 现状：仅 age 门槛失败（仓库创建未满 24 小时）；官方说明会自动重跑，不需要重复提交。
- 本机 token 为 fine-grained token，无上游 PR 写权限；PR 由用户手动提交。

## 3. npm

未发布：本机无 npm 登录。社区目录与安装都用 git 源，不依赖 npm。发布后把索引源改回 `npm`，填真实 `publishTimestamp`，跑官方 `parseMarketIndex` 校验。

## 4. 官方校验

```powershell
npm i @deepseek-ai/dsh-plugin-market-index@0.2.1-rc.5 --no-save
node -e "import('@deepseek-ai/dsh-plugin-market-index').then(m=>{const j=JSON.parse(require('fs').readFileSync('community/index.example.json','utf8'));console.log(m.parseMarketIndex(j,'https://example.com/index.json'))})"
```

0.2.4 时已通过；索引格式未变。0.4.0 发布后应再跑一次。

## 5. 检查清单

- [x] 公开仓库（public）
- [x] `dsh.bundle` manifest、`cordis.patch.yml`、双语 locale、原创图标
- [x] Host 工具 10 个、Client 页签 `教学物料`
- [x] 安装、38 项测试、门禁 12 通过 / 0 失败 / 4 未执行
- [x] 仓库带 `dsh-plugin` topic
- [x] 社区目录条目文件已推到 fork 分支
- [ ] 社区目录 PR 合并（等 CI age 重跑与维护者审阅）
- [ ] npm 发布（缺登录，非必需）
