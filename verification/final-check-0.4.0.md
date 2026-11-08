# 0.4.0 功能提升记录

日期：2026-11-08。依据 `docs/FEATURE-DESIGN.md` 的 P0 与教师需求笔记，落地可验证的子集；未做的项明确列出。

## 已实现

| 能力 | 入口 | 证据 |
|---|---|---|
| 页模型：一时间轴段一页，页含课件要点、讲义正文、任务、讲稿、来源 | `pages.json`、`teaching_material_pages` | `tests/pages.test.js`；API `GET /api/pages` |
| 逐页编辑与近似预览 | Web UI「逐页」 | 已安装 `lib/client.js:282-285`；槽注册 `teaching-workbench` active |
| 保存即版本，可回退 | `.history/`、UI「版本回退」 | `restoreHistory` 测试；API `/api/history` |
| 导出 Markdown、分镜、Manim 脚本 | `teaching_material_export` | 复制案例实测：`handout.md`、`deck.md`、`storyboard.md`、5 个 `Scene*.py` |
| 可选 DOCX/PPTX 导出 | 同上，Python + python-docx/python-pptx | 复制案例实测：`handout.docx` 35,834 B、`deck.pptx` 33,213 B；缺依赖时返回 `degraded_reason` |
| 检查中心：门禁、语言、接地、来源聚合一屏 | UI「检查中心」、`GET /api/checks` | 验收案例：12 通过 / 0 不通过 / 4 未执行 |
| PAEG 语言检查 | `teaching_language_check`、`E2-language-paeg`、UI | 34 条违禁词、12 条替换；38 项测试 |
| 教师需求与媒体调研 | `docs/TEACHER-NEEDS.md`、`docs/MEDIA-PIPELINE.md` | 证据表与命令输出 |

## 未做与原因

- **真实 PPT 编辑器**：只做页数据与近似预览；版式以导出文件为准，避免在浏览器里做不保真的排版。
- **视频渲染**：本机无 manim/ffmpeg，只生成分镜与场景脚本；渲染路径未经实测，不宣称可用。
- **案例与来源向导（P0-1）**：只保留 CSV 编辑与来源门禁；结构化向导未做。
- **句级未接地提示**：需要逐句解析与人工确认交互，未做。
- **源文件 diff 与冲突并排视图**：未做；当前用 revision 乐观锁，过期返回 409。
- **npm 发布**：无 npm 登录；公开 git 仓库是当前安装源。

## 验证

- `node --test tests/*.test.js`：38 通过、0 失败、0 跳过。
- 安装：`plugin_manager install_bundle` 返回 `application=applied`，版本 0.4.0，10 个工具。
- API 实测（复制案例，不污染原案例）：`/api/pages`、`/api/pages/from-timeline`、`/api/export`、`/api/checks`、`/api/history` 返回正常。
- UI：`conversation.view` 槽中 `teaching-workbench` 注册为 active；刷新页面后可见「教学物料」页签。
- 未验证：真实浏览器内逐页编辑的视觉与交互（无浏览器控制）；Manim 渲染；社区目录 PR 合并。
