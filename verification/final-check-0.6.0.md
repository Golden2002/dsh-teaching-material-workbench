# 0.6.0 功能提升记录

日期：2026-11-08。补上“可编辑 PPT 大纲文字 + 选图片 + 指定文字/图片来源”“完整案例向导”“差异并排”。

## 已实现

| 能力 | 入口 | 验证 |
|---|---|---|
| 完整案例向导：标题、文件夹名、学科、学段、学习者、场景、时长、评估、初始来源、初始时间轴 | 顶栏「新建案例」；`POST /api/case` | 复制环境实测创建 17 个文件；`sources.csv`、`timeline.csv` 内容正确；40 项测试含向导 |
| PPT 大纲文字编辑 | 「逐页」页标题、课件要点、讲义正文、任务、讲稿 | 保存写 `pages.json` 并重建 `build/outline.md` |
| 选图片 | 「逐页」图示下拉：`figures.json` 条目或 `assets/` 图片；`GET /api/assets` | 实测返回 `assets/test.png` 与 F01 |
| 图片替代文本、图注、图片来源 | 「逐页」图示字段；来源下拉取 `sources.csv` | `slide.visual = {figure, asset, alt, caption, source}` |
| 图片预览 | 16:9 课件卡内 `<img>`；`GET /api/asset` | 实测 200，`image/png`，68 B |
| 图片进讲义/课件 | `handout.md`、`deck.md` 写 `![alt](asset)` + 图注/来源；DOCX/PPTX 嵌入图片 | PPTX 内实测 `ppt/media/image1.png`；`handout.docx` 35,961 B、`deck.pptx` 29,806 B |
| 差异并排（逐页字段） | 「版本回退」→ 对比当前；`GET /api/history/diff` | 实测旧版标题「导入」、新版「导入（改后）」；previous/current 均非空 |

## 未做与边界

- 真实 PPT 编辑器仍未做：页标题、要点、图片与图注在页数据里编辑，版式以导出的 pptx 为准。
- 图片只能从 `figures.json` 或 `assets/` 选，未做上传与裁剪；替代文本必填提示在界面上，未强制拦截保存。
- 差异并排是逐页字段表，不是字符级 diff；恢复仍是整版本恢复。
- 视频渲染仍未内置；Manim 只记方案（见 `MEDIA-PIPELINE.md` 第 10 节）。

## 验证

- `node --test tests/*.test.js`：40 通过、0 失败、0 跳过。
- 安装：`application=applied`，版本 0.6.0，10 个工具。
- API：`/api/case`、`/api/assets`、`/api/asset`、`/api/pages`、`/api/history/diff`、`/api/export` 实测 200。
- UI：`conversation.view` 槽 `teaching-workbench` active；刷新页面后可用「新建案例」与图示字段。
- 未验证：真实浏览器里的向导交互、图片在 PowerPoint 中的实际版式、社区目录合并。
