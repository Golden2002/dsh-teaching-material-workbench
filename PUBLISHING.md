# Publishing

Current version: **0.2.4**。本文把"已经完成"与"还缺外部权限"分开写，避免把计划写成结果。

## 1. 已完成

- 包结构与官方 Host bundle 规范一致：`dsh.bundle.patch`、`apply/inject/ctx.effect`、双语 locale、原创 SVG 图标、`exports`/`files`、`engines.dsh`、无安装脚本、无网络。
- 独立验收：7/7 工具、15 项门禁 12 通过 / 0 失败 / 3 未执行；安装态测试 22 项通过。
- 合规复核：PASS 15 / PARTIAL 6 / FAIL 0；6 项 PARTIAL 在 0.2.3–0.2.4 修复。
- 0.2.4 已生成 tarball 并安装到当前 desktop profile（见 `verification/final-check-0.2.4.md`）。

## 2. 通道 A：源码仓库（已完成）

插件源码推送到现有仓库 `Golden2002/teaching-material-workflow` 的 `plugins/dsh-teaching-material-workbench/`，并打 tag `plugin-v0.2.4`。

```bash
git clone git@github.com:Golden2002/teaching-material-workflow.git
cd teaching-material-workflow
git tag -l 'plugin-v0.2.4'
```

该仓库当前是 **private**。私有仓库不能作为社区索引的公开安装源。

## 3. 通道 B：npm（缺凭据，未完成）

本机 `npm whoami` 返回 `ENEEDAUTH`，`~/.npmrc` 没有 token。需要先登录：

```powershell
cd D:\团聚体\桌面\英语教学\我的学习\plugins\dsh-teaching-material-workbench
npm login
npm publish --access public
```

发布后：

1. 把 `community/index.example.json` 的 `publishTimestamp` 改为真实发布时的 Unix 秒；
2. 保持 `source.type: "npm"`；
3. 运行 `node community/validate-index.mjs community/index.example.json`；
4. 把该文件提交给社区索引维护者。

## 4. 通道 C：公开仓库（缺仓库权限，未完成）

社区索引的 git 源必须是公开 HTTPS 仓库，并带 40 位 commit SHA。可选：

- 在 GitHub 网页把 `teaching-material-workflow` 改为 public（仓库设置 → Danger Zone → Change visibility）；
- 或新建公开仓库，把 `plugins/dsh-teaching-material-workbench` 作为仓库根目录推上去。

改公开后：

```powershell
# 以插件目录为仓库根发布（示例：新公开仓库 dsh-teaching-material-workbench）
cd D:\团聚体\桌面\英语教学\我的学习\plugins\dsh-teaching-material-workbench
git init
git add .
git commit -m "feat: teaching material workbench plugin v0.2.4"
git remote add origin git@github.com:Golden2002/dsh-teaching-material-workbench.git
git push -u origin main
```

索引条目改为：

```json
"source": {
  "type": "git",
  "url": "https://github.com/Golden2002/dsh-teaching-material-workbench.git",
  "commit": "<40 位 commit SHA>"
}
```

## 5. 通道 D：社区索引提交（缺维护者入口）

官方索引格式 1 已按 `@deepseek-ai/dsh-plugin-market-index` 的校验规则核对。提交前必须：

1. 版本与 `package.json` 一致；
2. `publishTimestamp` 是真实 Unix 秒；
3. 源可公开安装（npm 或公开 git）；
4. 运行：

```powershell
node community/validate-index.mjs community/index.example.json
```

输出 `ok: true` 后，把 `community/index.example.json` 提交给社区索引维护者。当前没有维护者提交入口，也没有 npm/公开仓库，因此这一步未完成。

## 6. 发布前检查清单

- [x] `node --test tests/*.test.js` 22 项通过
- [x] `plugin_manager install_bundle` 返回 `application=applied`
- [x] `teaching_material_gate` 对验收案例 12 通过 / 0 失败 / 3 未执行
- [x] 包内 `community/validate-index.mjs` 可独立校验索引
- [ ] npm 登录（缺）
- [ ] 公开仓库（缺）
- [ ] 社区索引提交（缺入口）

## 7. 结论

发布前准备已完成，插件已安装并验证；**公开分发（npm/公开仓库/社区索引）被账号权限挡住**。需要用户完成其中任一项：`npm login`、把仓库改为 public、或提供可发布到的公开仓库。完成任一项后，按上面第 3–5 节执行即可，不需要改代码。
