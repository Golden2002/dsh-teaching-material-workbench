# 视频与 Manim 集成（可行性笔记）

调研日期：2026-11-08。原计划独立调研 agent 未产出结果；本笔记由 Lead 直接检查本机并联网核验。

## 本机工具链（实测）

| 工具 | 结果 | 证据 |
|---|---|---|
| manim | 未安装 | `Get-Command manim` 无结果 |
| ffmpeg / ffprobe | 未安装 | `Get-Command ffmpeg,ffprobe` 无结果 |
| Python | 3.14（`C:\Users\团聚体\AppData\Local\Python\pythoncore-3.14-64\python.exe`） | `python -c` 可运行 |
| python-pptx | 可用 | `importlib.util.find_spec('pptx')` → True |
| python-docx | 可用 | `find_spec('docx')` → True |
| moviepy | 可用 | `find_spec('moviepy')` → True |
| edge-tts | 可用 | `find_spec('edge_tts')` → True |
| PIL / matplotlib / numpy | 可用 | `find_spec` → True |
| LibreOffice (`soffice`) | 未安装 | `Get-Command soffice` 无结果 |

结论：本机可以做 DOCX/PPTX 导出（已验证生成 `handout.docx`、`deck.pptx`），不能渲染 Manim，也不能合成视频。

## 集成路线

1. **只生成脚本，不自动渲染**（已采用）。页数据派生：
   - `build/storyboard.md`：时间、画面、旁白、字幕、来源；
   - `animations/Scene01.py` 等：每页一个 Manim `Scene` 骨架，标题与要点已填入；
   - 渲染交给教师或 CI：`manim -pqh animations/Scene01.py Scene01`。
2. **可选渲染（P2）**。只有教师显式打开、且本机存在 manim/ffmpeg 时才调用外部命令；固定参数、60 秒超时、输出只写 `animations/` 与 `build/`，失败原样返回 stderr，不伪装成功。
3. **不做**视频托管、剪辑时间线、自动配音配乐、在线播放。理由：超出插件边界，且版权与存储责任不清。

## Manim 集成的安全边界

- 不把教师输入拼进 shell；以参数数组调用，脚本路径与输出路径固定。
- 场景脚本由模板生成，不执行 `pages.json` 里的任何内容。
- 文件只写案例目录内；拒绝 `..`。
- 渲染失败（缺字体、缺依赖、超时）返回失败原因，保留脚本供教师修改。

## 可复用工具（许可与维护需再核）

| 工具 | 许可/维护 | 本机 | 用途 |
|---|---|---|---|
| Manim Community | MIT（以仓库 LICENSE 为准，未核验） | 无 | 数学动画渲染 |
| ffmpeg | LGPL/GPL（构建相关，未核验） | 无 | 视频编码、字幕封装 |
| edge-tts | 以仓库 LICENSE 为准（未核验） | 有 | 旁白 TTS，需网络 |
| moviepy | MIT（未核验） | 有 | 简单剪辑合成 |
| python-pptx / python-docx | MIT（未核验） | 有 | 讲义与课件导出 |

许可与最近维护状态未逐项核验，接入前需查仓库 LICENSE 与最近提交。

## MVP 三步

1. 教师逐页写要点与讲稿 → 导出 `storyboard.md` + `Scene*.py`（已实现，`teaching_material_export targets=manim`）。
2. 教师本机装 manim 与 ffmpeg → 运行 `manim -pql` 出低清预览，确认后再 `-pqh` 出高清。
3. 需要旁白时用 edge-tts 生成音频，ffmpeg 合轨；失败时保留分镜与脚本，不阻断讲义与课件交付。

## 建议的工具接口（已在 `teaching_material_export` 内实现一部分）

- `teaching_material_export(directory, targets=['storyboard','manim'])`：返回文件路径、sha256、`degraded_reason`。
- 未实现：`teaching_material_render`。等有真实教师需求与本机 manim 后再加，避免装不上却提示成功的假功能。

## 风险

- 本机无 manim/ffmpeg，渲染路径无法验证；文档与 UI 必须显示“未渲染”。
- 中文字体缺失会让 Manim 报错或方框字；脚本只用默认字体，教师需自备中文字体。
- 视频生成耗时长，Host 工具调用有超时；渲染放外部终端更稳。
- 版权音乐与教材图片不能由插件自动配；分镜只写来源编号，素材由教师登记。
