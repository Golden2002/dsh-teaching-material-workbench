# 教学视频与 Manim 动画集成（可行性调研）

调研日期：2026-11-08（访问与实测时间 15:14–15:53 +08:00）。
插件版本：0.4.0（含 `teaching_material_pages`、`teaching_material_export`）。
调研者：DSH 团队 media-engineer。
本文替代同日 15:51 的现场速记版；速记版有四处结论与实测不符，见 1.1。

结论一句话：本机已经能合成“幻灯片、旁白与内嵌字幕”的 MP4，但不能渲染 Manim；插件应继续只出分镜与场景脚本，渲染作为可选外部步骤，能力缺失时如实降级。

## 0. 给集成决策的摘要

| 问题 | 结论 | 依据 |
|---|---|---|
| 本机能否出视频 | 能，走 ffmpeg，不走 Manim | 14.87 秒样例已合成，见 4.2 |
| Manim 能否用 | 当前不能：未安装，且没有 LaTeX | `import manim` 失败，`latex` 不在 PATH |
| 是否需要 LaTeX | 只有公式场景需要 | 官方安装文档把 LaTeX 列为可选步骤，见 2.3 |
| 能否在线 TTS | 不能：语音列表可用，合成返回 403 | edge-tts 7.2.8 实测，见 1.2 |
| 离线 TTS 备选 | 能用：Windows SAPI 中文语音 | 已生成 655,788 字节 WAV |
| 插件该做哪条路线 | 只生成分镜与场景脚本；渲染与合成为可选外部步骤 | 与 0.4.0 已实现导出一致 |
| 该不该内置 TTS | 不该 | 外部依赖、声音授权与在线服务条款都不在插件边界内 |

## 1. 本机工具链实测

### 1.1 速记版更正

| 速记版结论 | 实测结果 | 证据 |
|---|---|---|
| ffmpeg 未安装 | PATH 上没有，但 Python 包 imageio-ffmpeg 随包附带 ffmpeg 7.1 可执行文件，可编码 H.264 与 AAC、可烧字幕 | 见 1.2 第 4 条与 4.2 |
| 不能合成视频 | 已合成 1280×720、14.87 秒的 MP4，含旁白与内嵌中文字幕 | 见 4.2 |
| edge-tts 可用 | 包在，列语音正常；合成返回 403，当前不可用 | 见 1.2 第 8 条 |
| manim、ffmpeg 许可未核验 | manim 为 MIT；ffmpeg 为 LGPL 2.1+，GPL 组件启用时转 GPL 2+；本机构建是 GPL 构建 | 见 2 |

速记版还写“本机无 manim/ffmpeg，渲染路径无法验证”，这句只对 Manim 成立；ffmpeg 合成路径已在 4.2 验证。

### 1.2 实测记录

运行环境：

```text
Microsoft Windows NT 10.0.22631.0
PowerShell 5.1.22621.6133
```

1. Node 与包管理器可用，满足插件 `engines.node >= 20`：

```text
node --version   -> v25.5.0
npm --version    -> 11.19.1
pnpm --version   -> 12.6.0
```

2. Python 3.14.2，pip 26.2.1：

```text
python --version        -> Python 3.14.2
python -m pip --version -> pip 26.2.1 from C:\Users\团聚体\AppData\Local\Python\pythoncore-3.14-64\Lib\site-packages\pip (python 3.14)
```

3. manim 未安装，manimpango 也未安装：

```text
python -c "import manim; print(manim.__version__)"
-> ModuleNotFoundError: No module named 'manim'
python -c "import manimpango; print(manimpango.__version__)"
-> ModuleNotFoundError: No module named 'manimpango'
```

4. ffmpeg 不在 PATH，但 imageio-ffmpeg 0.6.0 随包附带 87,638,016 字节的可执行文件，版本 7.1：

```text
C:\Users\团聚体\AppData\Local\Python\pythoncore-3.14-64\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe

ffmpeg version 7.1-essentials_build-www.gyan.dev
libavutil 59.39.100 / libavcodec 61.19.100 / libavformat 61.7.100
编码器含 libx264、aac、libmp3lame、libvpx；滤镜含 subtitles 与 ass（libass）
configure 含 --enable-gpl --enable-version3
```

ffprobe 不在 PATH，imageio-ffmpeg 只带 ffmpeg。探测时长与轨道改用 `ffmpeg -i` 解析，或 Python 的 av 18.0.0。

5. 图像与视频库可用，并完成了最小渲染验证：

```text
moviepy 2.2.1  -> ColorClip 320×180、1 秒片段写盘成功，1,897 字节
av 18.0.0      -> import 成功
Pillow 11.3.0、numpy 2.4.1、scipy、matplotlib 3.10.8、opencv-python 4.13.0.90 -> 均可用
fonttools 4.61.1 -> 可用于字形覆盖检查
```

6. ffmpeg 能力验证（临时目录，探测后删除）：

```text
合成 2 秒 1280×720 测试视频：H.264 + AAC，694,890 字节，退出码 0
drawtext 写中文“教学视频测试 中文”：退出码 0，PNG 12,679 字节
SRT 转 ASS：退出码 0
```

7. LaTeX 未安装，公式渲染不可用：

```text
Get-Command latex,pdflatex,xelatex,miktex-console -> 均无结果
C:\Program Files\MiKTeX、C:\texlive -> 不存在
```

8. edge-tts 7.2.8 在线合成失败，语音列表成功：

```text
python -m edge_tts --list-voices
-> 322 个语音，其中 zh-CN 8 个（含 zh-CN-XiaoxiaoNeural、zh-CN-YunxiNeural）

python -m edge_tts --voice zh-CN-XiaoxiaoNeural --text "上课铃响了，我们来看三角函数的图像。" --write-media demo.mp3
-> aiohttp.client_exceptions.WSServerHandshakeError: 403, message='Invalid response status',
   url='wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?...&Sec-MS-GEC=...'
-> demo.mp3 为 0 字节，退出码 1
```

PyPI 上 edge-tts 最新版为 7.3.1（2026-10-13 上传），本机是 7.2.8。升级能否修复 403 未核验。

9. Windows SAPI 离线语音可用：

```text
Microsoft Huihui Desktop | zh-CN
Microsoft Zira Desktop  | en-US
合成中文 WAV：655,788 字节，时长 14.87 秒
```

音质偏机械，是否适合课堂未做教师试听，记为未核验。

10. faster-whisper 1.0.3 与 ctranslate2 4.8.1 可导入，但模型未下载，Hugging Face 不可达：

```text
Invoke-WebRequest https://huggingface.co/api/models/Systran/faster-whisper-tiny
-> 操作超时
本机无 .cache\huggingface 目录
```

11. 浏览器可用，Playwright 浏览器未安装：

```text
Chrome 156.0.8078.81（C:\Program Files\Google\Chrome\Application\chrome.exe）
Edge   156.0.4314.50（C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe）
%LOCALAPPDATA%\ms-playwright -> 不存在
```

12. LibreOffice 未安装：

```text
Get-Command soffice -> 无结果
C:\Program Files\LibreOffice、C:\Program Files (x86)\LibreOffice -> 不存在
```

只查了 PATH 与两个标准安装目录，没有全盘搜索；其他路径安装未核验。

13. 中文字体齐备，Noto 两套在系统字体目录：

```text
C:\Windows\Fonts\NotoSansSC-VF.ttf    17,773,244 字节
C:\Windows\Fonts\NotoSerifSC-VF.ttf   25,129,160 字节
另有 msyh.ttc、msyhbd.ttc、simhei.ttf、simsun.ttc、Deng.ttf、simkai.ttf、simfang.ttf、mingliub.ttc、YuGoth*.ttc
```

Noto Sans SC 属 SIL Open Font License 1.1（仓库 `Sans/LICENSE`，见 2.3）。SimHei、SimSun、微软雅黑等系统字体的分发条款未核验；建议视频只用 OFL 字体重排，不把系统字体文件随案例分发。

14. 已安装 Python 包版本与 PyPI 最新版：

| 包 | 本机 | PyPI 最新 | 最新版上传日期 |
|---|---|---|---|
| manim | 未安装 | 0.22.1 | 2026-10-27 |
| moviepy | 2.2.1 | 2.2.1 | 2025-05-21 |
| edge-tts | 7.2.8 | 7.3.1 | 2026-10-13 |
| faster-whisper | 1.0.3 | 1.2.1 | 2025-10-31 |
| imageio-ffmpeg | 0.6.0 | 0.8.1 | 未记录 |
| Pillow | 11.3.0 | 未记录 | 未记录 |

### 1.3 Manim 可安装性（只做静态核对，没有安装）

- manim 0.22.1 要求 Python >= 3.11（PyPI 元数据），本机 Python 3.14.2 满足。
- manim 的主包是 `py3-none-any` 纯 Python 轮子；编译型依赖在 PyPI 上都有 cp314 或 abi3 的 Windows 轮子：

| 依赖 | 版本 | Windows 轮子 |
|---|---|---|
| manimpango | 0.7.1 | cp314-cp314-win_amd64 |
| pycairo | 1.29.2 | cp314-cp314-win_amd64 |
| numpy | 2.5.4 | cp314-win_amd64 |
| scipy | 1.18.1 | cp314-win_amd64 |
| mapbox-earcut | 2.1.0 | cp314-win_amd64 |
| moderngl | 5.13.0 | cp314-win_amd64 |
| skia-python | 144.1 | cp314-win_amd64 |
| skia-pathops | 0.9.2 | cp310-abi3-win_amd64（abi3 兼容 3.14） |
| watchdog | 7.1.0 | py3-none-win_amd64 |

本机没有 MSVC 编译器（`Get-Command cl` 无结果），但上述轮子齐全，pip 安装理论上不需要编译。未实际安装，安装成功率、渲染结果、中文字体行为都记为未核验。

## 2. 上游仓库核验

数据来自 GitHub REST API，访问时间 2026-11-08 15:15–15:25 +08:00。推送时间保留 UTC 原值。

| 仓库 | Stars | 许可 | 最近推送（UTC） | 本机状态 | 在本项目中的用途 |
|---|---|---|---|---|---|
| [ManimCommunity/manim](https://github.com/ManimCommunity/manim) | 42,332 | MIT | 2026-11-05 | 未安装 | 数学动画渲染（可选） |
| [3b1b/manim](https://github.com/3b1b/manim) | 96,242 | MIT | 2026-09-09 | 未安装 | 不采用，社区版足够 |
| [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg) | 66,726 | 官方为 LGPL 2.1+，启用 GPL 组件时 GPL 2+ | 2026-11-08 | 7.1 已随 imageio-ffmpeg 落地 | 合成、字幕、封面封装 |
| [rany2/edge-tts](https://github.com/rany2/edge-tts) | 12,484 | LGPLv3（仅 srt_composer.py 为 MIT） | 2026-10-14 | 7.2.8，合成 403 | 不内置，仅记为外部可选 |
| [Zulko/moviepy](https://github.com/Zulko/moviepy) | 15,122 | MIT | 2026-08-26 | 2.2.1 可用 | 简单剪辑脚本，非插件依赖 |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | 71,570 | Remotion License（个人与小团队免费，达到规模需商业授权） | 2026-11-07 | 未安装；npm 最新 4.0.541 | 不采用 |
| [openai/whisper](https://github.com/openai/whisper) | 112,210 | MIT | 2026-08-31 | 未安装 | 不采用，模型需下载 |
| [SYSTRAN/faster-whisper](https://github.com/SYSTRAN/faster-whisper) | 26,580 | MIT | 2026-11-06 | 1.0.3 可导入，模型缺失 | 字幕转写备选，默认关闭 |
| [imageio/imageio-ffmpeg](https://github.com/imageio/imageio-ffmpeg) | 304 | BSD-2-Clause | 2026-11-03 | 0.6.0，随包附带 ffmpeg 7.1 | 本机 ffmpeg 的实际来源 |

补充核验：

- FFmpeg 官方许可页写明 LGPL 2.1+，并入 GPL 组件后整体转 GPL 2+（[ffmpeg.org/legal.html](https://ffmpeg.org/legal.html)，2026-11-08）。本机构建启用了 `--enable-gpl --enable-version3`，属 GPL 构建。插件不得把该二进制打进分发包，否则要承担 GPL 分发义务。
- FFmpeg 官方下载页当前源码包为 `ffmpeg-9.0.2.tar.xz`（[ffmpeg.org/download.html](https://ffmpeg.org/download.html)，2026-11-08），本机是 7.1。
- Remotion 的 `LICENSE.md` 写明个人与小公司可免费使用，达到规模的在营利组织需商业授权。许可与机构规模相关，未做法务确认，未核验。
- edge-tts 的 `LICENSE` 开头写明：除 `src/edge_tts/srt_composer.py` 用 MIT，其余文件用 LGPLv3。它调用微软 Edge 朗读服务的非公开接口，服务条款与稳定性风险未核验。
- Manim 的 GitHub 许可字段为 MIT；社区版文档版本 0.22.1。

### 2.1 Manim 的依赖与渲染要求

manim 0.22.1 的 `requires_dist` 含 av、pydub、manimpango、pycairo、numpy、scipy、mapbox-earcut、moderngl、skia-pathops、svgelements 等。它不再依赖系统 ffmpeg 完成常规编码的结论只是推断：官方安装文档的步骤里没有列 ffmpeg，包依赖里有 av。未核验。

官方安装文档 `docs/source/installation/uv.md` 把 LaTeX 列作第 2 步“可选”：需要渲染公式的教师才装。纯文字场景用 `Text`，不依赖 LaTeX。

`av` 18.0.0 已满足 manim 的 `av>=15.0` 要求。LaTeX 缺失只影响 `Tex` 与 `MathTex`。

### 2.2 与现有插件的衔接

0.4.0 的 `teaching_material_export`（`lib/pages.js`）已经实现脚本路线：

- `build/storyboard.md`：表头为“时间、画面、旁白、字幕、来源”，时长按页分钟累加（`pages.js:201-211`）。
- `animations/SceneNN.py`：每页一个 `Scene`，用 `Text()` 写标题与要点，固定写法，不接受 `pages.json` 里的可执行内容（`pages.js:212-222`）。
- 缺 Manim 或 ffmpeg 时只记降级原因，不假装渲染（`pages.js:221`）。
- DOCX 与 PPTX 走 `lib/office-export.js`：`spawnSync` 参数数组、无 shell、60 秒超时、`windowsHide: true`、失败截断 600 字符返回（`office-export.js:15-34`）。这条路径可以作为外部命令调用的安全模板。

两个已知缺口：

1. 场景脚本调用 `Text()` 时没有传 `font=`，默认字体对中文可能报错或缺字。建议模板显式传 `font="Noto Sans SC"`，并在导出结果里写一条降级说明。
2. 降级文案“本机未检测到 manim/ffmpeg”按 PATH 判断。本机 ffmpeg 在 imageio-ffmpeg 里，不在 PATH，检测会误报缺失。建议探测顺序：PATH 的 ffmpeg → `python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"` → 配置项显式路径。

## 3. 集成路线

### 3.1 两条路线的取舍

| 维度 | 只生成脚本（已采用） | Host 工具调用外部命令 |
|---|---|---|
| 稳定性 | 高，输出是文本 | 受环境影响：Python、字体、编码器、CPU |
| 教师门槛 | 需要会一条命令行 | 一键出片，门槛低 |
| 失败影响 | 不影响讲义与课件 | 长任务可能拖住工具调用 |
| 安全面 | 只写文件 | 进程、路径、参数、超时都要防守 |
| 测试成本 | 低，可做快照测试 | 高，需要环境矩阵与超时测试 |
| 插件定位 | 保持零依赖、无网络 | 依赖外部程序，性质改变 |

结论：分三档推进。

- P0 保持现状：`teaching_material_export` 出分镜与场景脚本，不渲染。
- P1 增加只读能力探测与可选合成：只做 ffmpeg 合成与检查，固定模板、固定参数、超时与进程树终止；Manim 渲染默认关闭，探测到 manim 且教师显式开启才允许。
- P2 不引入 Remotion、Docker、在线 CI 或渲染集群。

### 3.2 Manim 场景脚本的输入、输出与错误处理

输入：

- `pages.json`，或由它导出的 `build/storyboard.md`。
- `lesson.yml` 的标题与学习者信息。
- `palette.json` 的配色约束。

输出：

- `animations/Scene01.py` 至 `SceneNN.py`，每页一个。
- 可选 `animations/manim.cfg`，固定分辨率 1280×720、30 fps、输出目录 `media/`。

错误处理：

- 未安装 manim：返回 `degraded_reason`，不写假视频。
- 缺 LaTeX 且场景含公式：预检直接失败，提示装 MiKTeX 或把公式改成图片。
- 缺字体：预检用 fontTools 扫可用字体的 cmap，缺字报具体字符。
- 渲染非零退出：保留脚本，返回最后 20 行 stderr。
- 超时：杀进程树，删未完成的输出，记录耗时。

### 3.3 安全边界

以下条款可直接写进实现，前四条已有 `office-export.js` 先例。

1. 不拼 shell：`spawnSync(exe, args, { shell: false })`，参数用数组传；教师文本一律写临时文件，不进命令行。
2. 参数白名单：只允许固定子命令与固定 flag 组合；数字参数做范围校验；出现以 `-` 开头的用户输入直接拒绝。
3. 路径围栏：`resolve` 后用 `startsWith(root + sep)` 判断；只允许写 `build/` 与 `animations/`；拒绝 `..`、绝对路径、UNC 路径与 Windows 保留设备名。
4. 工作目录与相对文件名：ffmpeg 的 `subtitles` 滤镜在 Windows 上会被盘符冒号与反斜杠干扰。实测绝对路径报 `Unable to parse option value ... as image size`，退出码 -22；把工作目录切到素材目录、滤镜只写 `subtitles=caption.srt` 就成功。工具实现应固定这一做法。
5. 超时与终止：合成默认 120 秒，渲染默认 300 秒，上限 600 秒；Windows 下 `spawnSync` 的超时只结束直接子进程，需要 `taskkill /PID <pid> /T /F` 才能清掉 python 派生的子进程。
6. 日志上限：stdout 与 stderr 截断到 4 KB，写 `verification/media-log.json`；工具返回只给摘要与错误码。
7. 网络默认关闭：合成不联网；TTS 不进插件，由教师用外部工具完成。
8. 不执行用户代码：场景脚本由模板生成；教师手改的脚本属于外部行为，插件不代跑。P1 若开放渲染，只渲染固定路径下的 `animations/SceneNN.py`，并校验文件名符合 `^Scene\d{2}\.py$`。
9. 并发与资源：同一案例同时只允许一个渲染任务，用锁文件防重复；渲染前检查磁盘剩余空间，预估产物体积。
10. 幂等：输出先写 `.part` 再原子重命名；失败清理 `.part`；成功写 sha256 到清单。

## 4. 视频物料 MVP

### 4.1 一个 3–5 分钟讲透一个知识点的最小组成

| 环节 | 产出 | 依赖 | 本机状态 |
|---|---|---|---|
| 逐页内容 | `pages.json` | 插件自身 | 已实现 |
| 分镜与讲稿 | `build/storyboard.md` | 插件自身 | 已实现，旁白时长按页分钟粗估 |
| 逐句字幕 | `build/media/caption.srt` | 文本拆分规则 | 未实现，建议新增 |
| 旁白音频 | `build/media/narration.wav` 或 mp3 | 离线 SAPI、在线 TTS、教师录音 | SAPI 可用；edge-tts 当前 403 |
| 画面 | 幻灯片帧或 Manim 视频 | Pillow、matplotlib、Manim | Pillow 与 matplotlib 可用；Manim 不可用 |
| 合成 | `build/media/lesson.mp4` | ffmpeg 7.1 | 可用，已跑通 |
| 封面 | `build/media/cover.png` | Pillow | 可用，未单独验收 |
| 检查 | `verification/media-report.md` | ffmpeg 探测、fontTools | 未实现 |

### 4.2 已跑通的最小合成（14.87 秒样例）

步骤：

1. 用 Pillow 与 `NotoSansSC-VF.ttf` 画 3 张 1280×720 幻灯片，写入 `slide1.png`（29,832 字节）、`slide2.png`（25,267 字节）、`slide3.png`（21,883 字节）。
2. 写 SRT 三屏字幕，每屏 4 秒。
3. 用 Windows SAPI 生成中文旁白 `narration.wav`（655,788 字节）。
4. ffmpeg 用 concat 读幻灯片列表，加旁白，烧字幕，编码 H.264 与 AAC：

```powershell
$ff = 'C:\Users\团聚体\AppData\Local\Python\pythoncore-3.14-64\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'
& $ff -hide_banner -loglevel error -y `
  -f concat -safe 0 -i slides.txt `
  -i narration.wav `
  -vf "fps=25,format=yuv420p,subtitles=caption.srt:force_style='FontName=Noto Sans SC,FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=0'" `
  -c:v libx264 -preset veryfast -crf 26 -c:a aac -b:a 96k -shortest lesson.mp4
```

结果：

```text
退出码 0，lesson.mp4 211,708 字节
Duration 00:00:14.87，bitrate 113 kb/s
Stream #0:0 Video: h264 (High), yuv420p, 1280x720, 25 fps
Stream #0:1 Audio: aac (LC), 22050 Hz, mono, 75 kb/s
```

抽帧检查：第 1 秒与第 9 秒的帧里，标题与要点中文无方框。底部字幕显示正确，CJK 字形与 libass 烧字都正常。字幕文本分别为“三角函数的图像从单位圆开始”与“把点连起来，就是周期为 2π 的正弦曲线”。

这次样例暴露一个必须检查的问题。旁白实测 14.87 秒，按 3 屏、每屏 4 秒排的分镜只有 12 秒。成片时长等于旁白时长，画面被拉长到与音频等长。字幕与画面帧的时长必须与音频显式对齐，否则末屏会被覆盖。检查项要包含音频时长与最后一条字幕结束时间的比对。

### 4.3 旁白、字幕、封面与版权

旁白三条路，按推荐顺序：

| 方案 | 现状 | 优点 | 风险 |
|---|---|---|---|
| 教师录音 | 未实测 | 音质最好，语气可控 | 需要麦克风与安静环境 |
| Windows SAPI | 可用，中文 Huihui | 离线、免费、零依赖 | 机械音，听感未验收 |
| edge-tts | 语音列表可用，合成 403 | 神经音质好 | 非公开接口，条款与稳定性未核验 |

字幕要求：

- 一屏不超过两行，每行不超过 24 个汉字，单屏 2–8 秒。
- 时间戳单调不重叠，覆盖整段旁白。
- 输出 UTF-8 无 BOM，ffmpeg 与播放器都能读。
- 除了烧进画面，同时保留 `.srt` 与外挂字幕能力；无障碍场景要求提供字幕（WCAG 2.2 SC 1.2.2，插件 standards 登记表已有该条）。

封面：

- 与视频首帧同源，用 Pillow 从首屏幻灯生成 `cover.png`。
- 含标题、学段与学科、来源编号，不放入未登记版权的图片。

版权：

- 音乐只用 CC0、自录或不用；不自动配乐。
- 教材图片与原文不入案例目录，只登记定位与来源编号。
- 字体用 OFL 授权字体（Noto Sans SC 已装），系统字体文件不分发。
- 专利与肖像素材需要教师自行确认授权，插件只做登记与审计。

## 5. MVP 三步（脚本、渲染、检查）

### 5.1 第一步 脚本：已实现

入口：`teaching_material_export(directory, targets=['storyboard','manim'])`。

验收标准：

- `build/storyboard.md` 每页一行，含时间、画面、旁白、字幕、来源五列；来源列只写编号。
- `animations/SceneNN.py` 数量等于页数，每页一个类，类名与文件名一致。
- 返回 `artifacts[].sha256`，以及 `degraded_reason`；未渲染必须在降级原因里写明。
- 不产生视频文件，也不在返回值里声称有视频。

### 5.2 第二步 渲染与合成：ffmpeg 路线已验收，Manim 路线环境不满足

ffmpeg 路线（可用）：

- 输入：`build/media/slide*.png` 或帧序列、`narration.wav`、`caption.srt`。
- 输出：`build/media/lesson.mp4`。
- 实测耗时：14.87 秒视频在 1 分钟内完成；3–5 分钟成片的耗时与体积未实测。
- 参数上限：1280×720 或 1920×1080、25 或 30 fps、CRF 18–30、AAC 64–192 kb/s、时长不超过 10 分钟。

Manim 路线（当前不可用）：

- 预检：`python -m manim --version`、场景文件存在且符合命名规则、含公式时检查 LaTeX。
- 渲染：`python -m manim -ql animations/Scene01.py Scene01`，高清换 `-qh`。
- 产物：manim 默认写 `media/videos/<script>/<quality>/`，需在工具里固定 `--media_dir` 或读取实际路径后登记。
- 失败即返回 `unavailable` 或错误码，不写假 MP4。

### 5.3 第三步 检查：建议新增，未实现

检查项与阈值：

| 检查 | 方法 | 通过标准 |
|---|---|---|
| 容器与编码 | `ffmpeg -i` 解析或 PyAV | MP4，H.264，AAC |
| 分辨率与帧率 | 同上 | 至少 1280×720，至少 24 fps |
| 时长 | 同上 | 与分镜计划差不超过 5% |
| 音轨 | 同上 | 存在音频流，时长与视频差不超过 0.3 秒 |
| 字幕 | 解析 SRT | 时间戳单调，首条从 0 开始，末条不晚于视频结束 |
| 字幕覆盖 | 与旁白比对 | 覆盖旁白时长的 95% 以上；旁白未知时记 skip |
| 字体覆盖 | fontTools 读 cmap | 字幕用到的所有汉字都在指定字体里 |
| 对比度 | 复用 `gate.js` 的 `contrastRatio` | 正文配色 ≥ 4.5:1 |
| 权利字段 | `media.csv` 或 `sources.csv` | 每个外部素材都有来源与许可 |
| 产物指纹 | SHA-256 | 写入 `verification/repro.json` |

状态只允许 pass、fail、skip 三种。skip 不能当通过；没有产物时记 skip，并在报告里写明原因。

## 6. 建议的工具接口

命名沿用 `teaching_material_*`。参数 schema 要遵守现有守卫：属性级不能写 `required: true`，`additionalProperties` 只能是布尔值。

### 6.1 `teaching_material_captions`（P0，建议先做）

用途：从页数据生成逐句字幕与旁白时长估算，不调用外部命令。

| 项 | 内容 |
|---|---|
| 参数 | `directory`（必填，绝对路径）；`max_chars`（每屏汉字数，默认 24，范围 12–40）；`seconds_per_char`（朗读速度，默认 0.22，范围 0.15–0.35）；`overwrite`（默认 false） |
| 返回 | `ok`、`captions_path`、`cues`（条数）、`total_seconds`、`pages`（每页时长）、`warnings`（超长句、缺讲稿的页） |
| 输出文件 | `build/media/caption.srt`、`build/media/cues.json` |
| 验收 | 时间戳单调不重叠；末条不早于计划时长；每屏不超过 `max_chars`；单页缺讲稿时 warning 而不是静默补空；不覆盖已有文件除非 `overwrite=true` |

### 6.2 `teaching_material_media_render`（P1，默认关闭）

用途：显式开启后调用本机 ffmpeg 或 manim，出视频。

| 项 | 内容 |
|---|---|
| 参数 | `directory`（必填）；`engine`：`ffmpeg`、`manim`、`auto`，默认 `auto`；`quality`：`draft`、`final`，默认 `draft`；`timeout_s`（10–600，默认 120）；`dry_run`（默认 true，只做能力探测与计划） |
| 返回 | `ok`、`engine_used`、`artifacts`（每项含 `path`、`bytes`、`sha256`、`duration_s`、`streams`）、`capabilities`（ffmpeg 与 manim 的可用性、路径、版本）、`degraded_reason`、`log_path` |
| 行为 | `dry_run=true` 时不写视频，只返回能力与计划；引擎缺失返回 `ok:false` 加错误码 `ffmpeg-not-found` 或 `manim-not-found`；超时杀进程树；失败清理 `.part`；只写 `build/media/` 与 `animations/` |
| 验收 | 成功时产物能被 `ffmpeg -i` 解析且时长大于 0；失败时不得留下 MP4；同案例并发请求只跑一个；返回的 sha256 与实际文件一致；日志写入 `verification/media-log.json` |

### 6.3 `teaching_material_media_check`（P0，建议先做）

用途：检查已合成的视频与字幕，写检查报告。

| 项 | 内容 |
|---|---|
| 参数 | `directory`（必填）；`video`（相对路径，默认 `build/media/lesson.mp4`）；`captions`（默认 `build/media/caption.srt`）；`expected_seconds`（可选，覆盖分镜计划时长） |
| 返回 | `ok`、`checks[]`（`id`、`layer`、`basis`、`status`、`detail`）、`summary`（pass、fail、skip 计数）、`report_path` |
| 输出文件 | `verification/media-report.md` |
| 验收 | 缺视频时 `fail` 或 `skip` 并写明原因，不能 pass；编码不符、无音轨、字幕断裂、字体缺字、权利字段缺失都判 fail；字体检查给出缺失字符清单；报告里每条都带依据 |

### 6.4 不建议新增的工具

- `teaching_material_media_plan`：分镜已由 `teaching_material_export` 覆盖，再建一个会重复。
- 独立的 TTS 工具：与 FEATURE-DESIGN 的“不做内置 TTS”冲突，且当前在线服务不可用。
- 视频上传、转码托管、在线播放工具：超出插件边界。

## 7. 明确不做

| 不做 | 理由 | 替代做法 |
|---|---|---|
| 视频托管、上传、在线播放、CDN | 存储、带宽、版权与隐私责任均在插件边界外 | 输出 MP4 交学校平台或本地播放 |
| 可视化剪辑、多轨、转场、调色 | 剪映、Premiere 的领域，不完整会误导教师 | 出分镜与素材清单，精剪交给外部工具 |
| 内置 TTS 与语音克隆 | 外部依赖、声音授权、在线服务条款都不可控；FEATURE-DESIGN 已定不做 | 导出讲稿与 SRT，旁白由教师用 SAPI、录音或外部 TTS |
| 自动配乐与版权音乐库 | 版权风险高，且与证据链无关 | 只允许 CC0、自录或静音 |
| 自动下载教材图片、视频素材 | 版权与网络边界 | 教师登记来源编号，素材自行放入 `assets/` |
| ASR 全自动字幕 | faster-whisper 模型未就位，Hugging Face 不可达 | 保留手动字幕；以后可作为默认关闭的钩子 |
| 4K、60 fps、10 分钟以上长片渲染 | Host 工具调用时长不可控，环境差异大 | 720p 或 1080p，10 分钟以内 |
| 在线渲染集群、Docker、CI 托管 | 插件无网络、零依赖的定位 | 教师本机或学校流水线自行执行命令 |
| 自动安装 Manim、LaTeX、LibreOffice | 安装属环境变更，失败会留下半装状态 | 文档给命令，教师确认后自行安装 |
| 学生录屏、摄像头、学生数据采集 | 隐私与合规风险 | 不涉及 |

## 8. 风险与失败回退

| 风险 | 触发条件 | 影响 | 回退 | 状态 |
|---|---|---|---|---|
| Manim 装不上 | pip 解析失败或系统缺依赖 | 动画无法出片 | 保留场景脚本；改用 ffmpeg 幻灯片路线 | 未核验（轮子齐全，未实测安装） |
| 缺 LaTeX | 场景含 `Tex` 或 `MathTex` | 公式场景渲染失败 | 预检拦截，改 `Text` 或把公式做成图片 | 已确认 LaTeX 缺失 |
| 中文字体缺字 | 使用默认字体或字体不支持生僻字 | 方框或渲染报错 | 指定 Noto Sans SC；fontTools 检查缺失字符 | 字体已确认存在 |
| 在线 TTS 不可用 | 服务改接口或封禁 | 旁白缺失 | 改 SAPI 或教师录音；字幕照常交付 | 已触发 403 |
| 长任务超时 | 视频过长、机器慢 | 工具调用中断或卡死 | 限制时长与分辨率；超时杀进程树；渲染放外部终端 | Host 超时机制未核验 |
| 字幕错位 | 按字数估时，语速不均 | 音画不同步 | 检查音频与末条字幕比对；教师试听后微调 | 样例已暴露截断问题 |
| 路径含中文 | 用户名含中文、路径带空格 | ffmpeg 滤镜解析失败 | 切工作目录用相对名 | 绝对路径已实测失败 |
| 版权音乐与教材图片 | 教师自行加入未授权素材 | 侵权风险 | rights 审计拦截；只登记来源不复制原件 | 审计已存在 |
| 产物体积过大 | 高码率或长片 | 磁盘与传输成本 | CRF 26、720p、时长上限，先出 draft | 样例 14.87 秒 211 KB，外推未实测 |
| 未完成文件残留 | 进程被杀或磁盘满 | 下次运行误判成功 | 写 `.part` 再原子重命名；启动前清理 | 建议实现 |
| 并发渲染抢占 CPU | 多会话同时请求 | 机器卡顿、超时 | 锁文件串行化 | 建议实现 |
| GPL 分发义务 | 把 imageio-ffmpeg 的二进制打进包 | 许可污染 | 不打包，运行时探测本机可执行文件 | 已确认本机构建为 GPL |

## 9. 未核验清单

以下条目没有完成验证，引用时须保留“未核验”标注：

1. Manim 在本机的实际安装与渲染（只核对了 Python 版本与轮子存在性）。
2. Manim 0.22.1 是否完全不需要系统 ffmpeg（依赖里有 av，文档步骤未列 ffmpeg，属推断）。
3. edge-tts 7.3.1 能否修复 403（只查了 PyPI 版本与上传日期，没有升级）。
4. Windows SAPI 中文音质在课堂场景是否可接受（没有教师试听）。
5. LibreOffice 是否装在非标准路径（只查了 PATH 与两个常见目录）。
6. DSH Host 工具执行是否有超时与取消机制（只读到插件侧 `async execute`，上游行为未查证）。
7. Remotion 许可条款对具体机构规模的适用（未做法务确认）。
8. 系统预装中易字体的商用与分发条款（只确认字体存在）。
9. 3–5 分钟成片的渲染耗时、体积与播放兼容性（只测了 14.87 秒样例）。
10. 字幕与旁白的精确同步方案（样例用固定 4 秒分屏，未做逐句对齐）。
11. imageio-ffmpeg 0.6.0 与 Pillow 11.3.0 的 PyPI 最新上传日期（表格中标“未记录”）。
12. 硬件对渲染速度的影响（CPU、内存、编码器未查）。

## 10. 证据索引

命令证据（均在本机执行，2026-11-08）：

```text
manim 缺失：python -c "import manim" -> No module named 'manim'
ffmpeg 路径：C:\Users\团聚体\AppData\Local\Python\pythoncore-3.14-64\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe
ffmpeg 版本：ffmpeg version 7.1-essentials_build-www.gyan.dev
编码验证：2 秒 1280x720 H.264+AAC -> 694,890 字节，退出码 0
中文 drawtext：PNG 12,679 字节，退出码 0
字幕烧入：13,298 字节 MP4，退出码 0（相对路径）
字幕绝对路径：退出码 -22，报 "Unable to parse option value ... as image size"
SRT 转 ASS：退出码 0
edge-tts 语音列表：322 个，zh-CN 8 个
edge-tts 合成：403 WSServerHandshakeError，0 字节输出
SAPI 语音：Microsoft Huihui Desktop（zh-CN）、Microsoft Zira Desktop（en-US）
SAPI 合成：655,788 字节 WAV
moviepy：320x180 片段 1,897 字节
Hugging Face API：操作超时
LibreOffice：Get-Command soffice 无结果
字体：NotoSansSC-VF.ttf 17,773,244 字节；NotoSerifSC-VF.ttf 25,129,160 字节
Chrome 156.0.8078.81；Edge 156.0.4314.50
```

URL 证据（2026-11-08 访问）：

- https://github.com/ManimCommunity/manim
- https://github.com/3b1b/manim
- https://github.com/FFmpeg/FFmpeg
- https://github.com/rany2/edge-tts
- https://github.com/Zulko/moviepy
- https://github.com/remotion-dev/remotion
- https://github.com/openai/whisper
- https://github.com/SYSTRAN/faster-whisper
- https://github.com/imageio/imageio-ffmpeg
- https://api.github.com/repos/ManimCommunity/manim（stars、license、pushed_at）
- https://ffmpeg.org/legal.html
- https://ffmpeg.org/download.html
- https://raw.githubusercontent.com/rany2/edge-tts/master/LICENSE
- https://raw.githubusercontent.com/remotion-dev/remotion/main/LICENSE.md
- https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/LICENSE
- https://pypi.org/pypi/manim/json
- https://pypi.org/pypi/manimpango/json
- https://pypi.org/pypi/pycairo/json
- https://pypi.org/pypi/edge-tts/json
- https://pypi.org/pypi/imageio-ffmpeg/json
- https://registry.npmjs.org/remotion/latest
- https://docs.manim.community/en/stable/installation/uv.html
- https://docs.manim.community/en/stable/installation.html

插件内证据：

- `lib/pages.js:201-211` 分镜导出。
- `lib/pages.js:212-222` Manim 场景脚本导出与降级说明。
- `lib/office-export.js:15-34` 外部命令调用模板：`spawnSync`、参数数组、60 秒超时、`windowsHide`、错误截断。
- `lib/gate.js:276-326` 配色对比度与 WCAG 无障碍门禁，可供媒体检查复用。
