# 发布与最终安装检查（Lead，0.2.4）

生成时间：2026-11-07 16:20（Asia/Shanghai）

## 1. 发布版本

| 项 | 值 |
|---|---|
| 版本 | 0.2.4 |
| tarball | `release/dsh-teaching-material-workbench-0.2.4.tgz`，81,838 B |
| SHA-256 | `6E38F0CC245842551D513EF35A2D1A6AD273C65387B8F3100E44F36C64C1B32D` |
| npm dry-run | `npm publish --dry-run --access public` 通过；包 26 个文件，81.4 kB；提示“需要登录后才能真正发布” |
| 社区索引 | `community/validate-index.mjs` 输出 `ok: true` |

## 2. 源码仓库发布（已完成）

| 项 | 值 |
|---|---|
| 仓库 | `git@github.com:Golden2002/teaching-material-workflow.git`（private） |
| 分支 | `main` |
| 提交 | `0f47f80cde40e950f010f4ad940224778c408eb6` |
| tag | `plugin-v0.2.4`（指向同一提交） |
| 推送结果 | `a4b0ba6..0f47f80 main -> main`；`* [new tag] plugin-v0.2.4` |
| 远端文件 | `plugins/dsh-teaching-material-workbench/` 下 32 个文件 |

推送使用系统 OpenSSH：`git -c core.sshCommand=C:/Windows/System32/OpenSSH/ssh.exe push`。Git 自带 ssh 在本机用户目录含非 ASCII 字符时读不到 known_hosts，这一点与仓库 `docs/05-troubleshooting.md` 的记录一致。

## 3. 安装（已完成）

| 项 | 值 |
|---|---|
| 安装命令 | `plugin_manager install_bundle` |
| 结果 | `application=applied` |
| 已安装版本 | 0.2.4 |
| 安装日志 | `.plugin-manager\logs\operation-yM5XXZ\pnpm.log` |
| 工具 | 7 个：init / gate / ground / outline / audit / repro / standards |
| 安装态测试 | 从已安装目录运行 `node --test tests/*.test.js`：22 项通过、0 失败 |
| 门禁（case-acceptance） | 15 项：12 通过 / 0 失败 / 3 未执行；E2-knowledge PASS；skip 为 E2-rubric-source、E3-human、E3-pilot |

## 4. 发布通道状态

| 通道 | 状态 | 原因 |
|---|---|---|
| A 源码仓库（private） | 已完成 | 提交与 tag 已推送 |
| B npm | 未完成 | `npm whoami` 返回 `ENEEDAUTH`；`~/.npmrc` 无 token；需要 `npm login` |
| C 公开仓库 | 未完成 | 现有仓库为 private；本机无 GitHub API token，无法新建公开仓库或改可见性 |
| D 社区索引 | 未完成 | 依赖 B 或 C 的公开安装源；本机没有索引维护者提交入口 |

## 5. 解除阻塞的下一步（任选其一）

1. **npm 路线**：在本机运行 `npm login`，然后：

   ```powershell
   cd D:\团聚体\桌面\英语教学\我的学习\plugins\dsh-teaching-material-workbench
   npm publish --access public
   ```

   发布后把 `community/index.example.json` 的 `publishTimestamp` 改为真实发布秒数，再运行 `node community/validate-index.mjs community/index.example.json`，把文件提交给社区索引维护者。
2. **公开仓库路线**：在 GitHub 网页把 `Golden2002/teaching-material-workflow` 改为 public，或新建公开仓库 `dsh-teaching-material-workbench` 并推送插件目录；然后把索引的 `source` 改为 `git`，填 `url` 与 40 位 commit SHA。
3. **提供 token**：给出可用的 GitHub API token 或 npm token，由我完成建库/发布/索引提交。

## 6. 仍未执行

- 无同行评审、无试点数据，E3 两项为未执行。
- 没有教学效果 A/B 数据，`docs/BENCHMARK.md` 只比较公开能力结构。
- 官方 `parseMarketIndex` 未实际执行；`community/validate-index.mjs` 是按源码规则实现的预校验。
