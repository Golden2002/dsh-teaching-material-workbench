# 0.5.0 功能提升记录

日期：2026-11-08。承接 0.4.x 的 P0 缺口，补上来源、句级接地、版本差异与课件预览；Manim 按用户要求只记方案，不搭建虚拟环境、不安装。

## 已实现

| 能力 | 入口 | 验证 |
|---|---|---|
| 来源卡片编辑：id/title/publisher/date/type/locator/access/license/verified/role | Web UI「来源」 | API `GET/POST /api/sources` 返回 200；复制案例计数 total=3、primary_verified=2、unverified=1、restricted=1 |
| 未核验、受限来源计数 | 「来源」顶部 | 同上 |
| 句级未接地提示：讲义实质句无 `[Sxx]` 时列出 | Web UI「逐页」 | 客户端逻辑，按句切分并过滤短句与已有标记 |
| 给句子补来源标记 | 「逐页」下拉选来源 | 追加 `[Sxx]` 到该句并把来源加入页 `sources[]` |
| 版本差异并排视图 | 「版本回退」→ 对比当前 pages.json | API `GET /api/history/diff` 返回 200；首次保存时旧版本为空属预期 |
| 16:9 课件卡 + 讲义卡预览 | 「逐页」右栏 | 近似预览，标注“以导出文件为准” |
| Manim 方案记录 | `docs/MEDIA-PIPELINE.md` 第 10 节 | 未搭建 venv、未安装 |

## Manim 复核

用户称本机有 manim。当前会话复核：`Get-Command manim` 无结果；`python -m manim --version` 报 `No module named manim`；`py -0p` 仅 Python 3.14；常见路径未找到 `manim.exe`。按用户要求不做安装或虚拟环境，Manim 只保留脚本生成与外部渲染说明。

## 未做与边界

- **真实 PPT 编辑器**：仍只做页数据与 16:9 近似预览；版式以导出的 pptx 为准，不在浏览器里复刻 PowerPoint。
- **视频渲染**：插件不内置 ffmpeg/Manim 渲染；只出分镜、讲稿、SRT 与 Manim 场景脚本。
- **来源向导新建案例**：只做来源卡片编辑，未做“从教材主题一键建案例”的完整向导。
- **差异并排**：当前是整文件文本并排，不是逐页字段 diff。
- **社区目录 PR**：已更新描述并触发 CI；等待 age 门槛后的运行结果。

## 验证

- `node --test tests/*.test.js`：38 通过、0 失败、0 跳过。
- 安装：`plugin_manager` 返回 `application=applied`，版本 0.5.0。
- API：`/api/sources`、`/api/history/diff` 实测 200；`/api/pages`、`/api/export`、`/api/checks` 沿用 0.4.x 实测。
- UI：`conversation.view` 槽 `teaching-workbench` active；刷新页面后出现「教学物料」页签与五个子页签。
- 未验证：真实浏览器里的视觉与交互、Manim 渲染、社区目录合并。
