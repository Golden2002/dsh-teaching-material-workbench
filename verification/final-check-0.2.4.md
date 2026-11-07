# 发布与最终安装检查（Lead，0.2.4）

生成时间：2026-11-07 16:40（Asia/Shanghai）

## 1. 公开仓库（已完成）

| 项 | 值 |
|---|---|
| 仓库 | <https://github.com/Golden2002/dsh-teaching-material-workbench>（public） |
| 默认分支 | `main` |
| 发布提交 | `7b805288da07a1985157948f35feb940179bb384` |
| 最新提交 | `e0d81cc`（发布文档与索引源更新） |
| tag | `v0.2.4` |
| topics | `dsh-plugin`、`deepseek-harness`、`teaching`、`education`、`workflow` |
| 文件数 | 37 |
| 版本 | `package.json` 0.2.4 |

## 2. 安装与验证（已完成）

| 检查 | 结果 |
|---|---|
| 本地安装 | `plugin_manager install_bundle` → `application=applied`，版本 0.2.4，7 个工具 |
| 安装态测试 | 22 项通过、0 失败 |
| 门禁（case-acceptance） | 15 项：12 通过 / 0 失败 / 3 未执行 |
| 公开仓库 SSH clone | 成功；clone 内 `node --test` 22 项通过 |
| 公网 git 安装 | `pnpm add git+https://github.com/Golden2002/dsh-teaching-material-workbench.git#7b80528…` 成功，安装版本 0.2.4 |
| 官方索引校验 | 安装 `@deepseek-ai/dsh-plugin-market-index@0.2.1-rc.5` 后运行 `parseMarketIndex`：通过；`marketInstallTarget` 产出 `git+https://…#7b80528…` |
| tarball | 81,838 B；SHA-256 `6E38F0CC245842551D513EF35A2D1A6AD273C65387B8F3100E44F36C64C1B32D` |

注意：本机 git 的 HTTPS 访问有 TLS 错误，SSH clone 与 pnpm 的 git 拉取正常；这不影响公网用户，但记录在案。

## 3. 社区目录（进行中）

官方社区目录为 `awesome-dsh-plugin/awesome-dsh-plugin`（23,439 stars，CC0）。收录规则：在 `data/plugins/` 增加一个 YAML 文件；仓库需声明 `dsh.bundle`、满 1 天、带 `dsh-plugin` topic。

已完成：
- fork 仓库；
- 分支 `add-dsh-teaching-material-workbench`；
- 文件 `data/plugins/Golden2002__dsh-teaching-material-workbench.yml`（commit `e5cf334`）；
- 条目内容见 `community/catalog/`。

未完成：创建 PR。本机 token 是 fine-grained token，对上游仓库返回 `Resource not accessible by personal access token`。用户已手动提交：

PR #12902：<https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/12902>

仓库创建于 2026-11-07T08:24:25Z，距 1 天门槛约 23.9 小时；PR 已进入 CI，age 门槛会先失败并自动重跑，不需要重复提交。

## 4. npm（未做，非必需）

本机无 npm 登录。社区目录用 git 源即可。若要走 npm：

```powershell
npm login
npm publish --access public
```

发布后把索引源改回 `npm`，填真实 `publishTimestamp`，再跑官方校验器。

## 5. 仍未执行

- 社区目录 PR（需手动点一次 compare 链接；token 无上游 PR 权限）。
- npm 发布（缺登录，非必需）。
- 同行评审、试点数据、教学效果 A/B：均未开展，E3 两项在案例中记未执行。
