# Release 0.5.0

- 包：`dsh-teaching-material-workbench-0.5.0.tgz`（178,781 B）
- 校验：`SHA256SUMS`（SHA-256 `564AA2EDFCCEBA18175516FC50E1A0144CCC77BE12BBBE70A04095A987E68542`）
- 索引模板：`index.json`（git 源，commit 固定为发布提交）
- 安装：

```powershell
plugin_manager action=install_bundle target=git+https://github.com/Golden2002/dsh-teaching-material-workbench.git#v0.5.0
```

发布提交以 tag `v0.5.0` 为准；`git rev-parse v0.5.0^{commit}` 可得完整 SHA。

## 本版能力

- 页模型 `pages.json`：一个时间轴段一页；逐页编辑课件要点、讲义正文、任务、讲稿、来源。
- Web UI 四个页签：逐页、数据文件、检查中心、版本回退。
- 导出：`build/handout.md`、`build/deck.md`、`build/storyboard.md`、`animations/Scene*.py`；本机有 Python + python-docx/python-pptx 时出 `handout.docx`、`deck.pptx`。
- PAEG 教学语言检查：工具、`E2-language-paeg` 门禁、UI 语言检查。
- `.history/` 版本：保存页数据自动备份，可恢复；恢复前另存当前状态。

## 验收数据

| 项 | 值 |
|---|---|
| 测试 | 38 项通过、0 失败、0 跳过 |
| 工具 | 10 个 |
| 门禁 | 16 项；验收案例 12 通过 / 0 不通过 / 4 未执行 |
| 导出实测 | 复制案例上生成 `deck.pptx` 33,213 B、`handout.docx` 35,834 B、5 个 Manim 场景脚本 |
| 索引校验 | 官方 `parseMarketIndex` 通过（0.2.4 时验证；索引格式未变） |
| 安装 | `application=applied`，版本 0.4.0 |

## 说明

- DOCX/PPTX 依赖宿主机 Python 与 python-docx/python-pptx；缺失时返回降级原因，不伪造成功。
- Manim 只生成脚本，不渲染；本机未装 manim/ffmpeg。
- 预览是近似预览，版式以导出文件为准。
