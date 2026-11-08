"""Minimal DOCX export for dsh-teaching-material-workbench.

Reads an export JSON ({lesson, pages}) and writes a plain Word document.
Optional external helper: only runs when python-docx is installed.
"""

import json
import os
import sys


def safe_asset(base_dir, relative):
    if not base_dir or not relative:
        return None
    relative = str(relative).replace("\\", "/")
    if ".." in relative.split("/"):
        return None
    path = os.path.join(base_dir, relative)
    return path if os.path.isfile(path) else None


def main() -> int:
    import docx
    from docx.shared import Inches, Pt

    source, target = sys.argv[1], sys.argv[2]
    with open(source, encoding="utf-8") as handle:
        data = json.load(handle)
    lesson = data.get("lesson", {})
    pages = data.get("pages", [])
    base_dir = data.get("dir")

    document = docx.Document()
    document.add_heading(str(lesson.get("title") or "讲义"), 0)
    if lesson.get("duration_min"):
        document.add_paragraph(f"时长：{lesson['duration_min']} 分钟")
    if lesson.get("assessment"):
        assessment = lesson["assessment"]
        document.add_paragraph(f"评估：{assessment.get('type', '')}，{assessment.get('total_marks', 0)} 分")

    for index, page in enumerate(pages, start=1):
        handout = page.get("handout") or {}
        document.add_heading(str(handout.get("heading") or page.get("title") or f"第 {index} 节"), level=1)
        for paragraph in handout.get("paragraphs") or []:
            document.add_paragraph(str(paragraph))
        visual = page.get("slide", {}).get("visual") or {}
        image_path = safe_asset(base_dir, visual.get("asset"))
        if image_path:
            document.add_picture(image_path, width=Inches(5.5))
            caption = visual.get("caption") or visual.get("alt") or ""
            source_id = visual.get("source") or ""
            if caption or source_id:
                document.add_paragraph(f"图注：{caption}{f' [{source_id}]' if source_id else ''}")
        if handout.get("task"):
            document.add_paragraph(f"任务：{handout['task']}")
        sources = page.get("sources") or []
        if sources:
            document.add_paragraph("来源：" + "、".join(f"[{item}]" for item in sources))
        notes = page.get("notes")
        if notes:
            paragraph = document.add_paragraph(f"讲稿：{notes}")
            for run in paragraph.runs:
                run.font.size = Pt(10)

    document.save(target)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
