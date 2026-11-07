# Publishing

当前版本：**0.2.4**（公开仓库已发布，社区目录 PR 待一键提交）。

## 1. 已完成

| 项 | 值 |
|---|---|
| 公开仓库 | <https://github.com/Golden2002/dsh-teaching-material-workbench>（public） |
| 发布提交 | `7b805288da07a1985157948f35feb940179bb384` |
| tag | `v0.2.4` |
| tarball | `release/dsh-teaching-material-workbench-0.2.4.tgz`，81,838 B |
| SHA-256 | `6E38F0CC245842551D513EF35A2D1A6AD273C65387B8F3100E44F36C64C1B32D` |
| 安装 | `plugin_manager install_bundle` 返回 `application=applied`，7 个工具在线 |
| 测试 | 22 项通过，0 失败 |
| 门禁 | 验收案例 12 通过 / 0 失败 / 3 未执行 |

从公开仓库安装：

```powershell
plugin_manager action=install_bundle target=git+https://github.com/Golden2002/dsh-teaching-material-workbench.git#7b805288da07a1985157948f35feb940179bb384
```

## 2. 社区目录（awesome-dsh-plugin）

社区目录的收录规则：在 `data/plugins/` 增加一个 YAML 文件，仓库需声明 `dsh.bundle`、满 1 天、带 `dsh-plugin` topic。

已完成：

- 仓库添加 topic：`dsh-plugin`、`deepseek-harness`、`teaching`、`education`、`workflow`；
- fork `awesome-dsh-plugin/awesome-dsh-plugin`；
- 在 fork 的分支 `add-dsh-teaching-material-workbench` 提交条目文件 `data/plugins/Golden2002__dsh-teaching-material-workbench.yml`（提交 `e5cf334`）。

未完成：打开 PR。本机 token 是 fine-grained token，对上游仓库没有创建 PR 的权限，API 返回 `Resource not accessible by personal access token`。需要手动点一次：

<https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/compare/main...Golden2002:add-dsh-teaching-material-workbench?expand=1>

页面里的标题与正文可直接用 [`catalog/PR.md`](catalog/PR.md)。仓库创建未满 24 小时，CI 的 age 门槛会先失败；按官方说明会自动重跑并在约 24 小时内转绿，不需要重复提交。

## 3. npm（未完成）

本机没有 npm 登录（`npm whoami` 返回 `ENEEDAUTH`），也没有 NPM token。社区目录用 git 源即可，不依赖 npm。若要发 npm：

```powershell
npm login
npm publish --access public
```

发布后把 `community/index.example.json` 的 `source` 改回 `npm`，填真实 `publishTimestamp`，再运行官方校验器。

## 4. 官方校验

安装官方包后运行：

```powershell
npm i @deepseek-ai/dsh-plugin-market-index@0.2.1-rc.5 --no-save
node -e "import('@deepseek-ai/dsh-plugin-market-index').then(m=>{const j=JSON.parse(require('fs').readFileSync('community/index.example.json','utf8'));console.log(m.parseMarketIndex(j,'https://example.com/index.json'))})"
```

## 5. 检查清单

- [x] 公开仓库（public）
- [x] `dsh.bundle` manifest、`cordis.patch.yml`、双语 locale、原创图标
- [x] 安装、测试、门禁
- [x] 仓库带 `dsh-plugin` topic
- [x] 社区目录条目文件已推到 fork 分支
- [ ] 社区目录 PR（需手动点一次 compare 链接）
- [ ] npm 发布（缺登录）
