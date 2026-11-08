"""Minimal DOCX export for dsh-teaching-material-workbench.

Reads an export JSON ({lesson, pages}) and writes a plain Word document.
Optional external helper: only runs when python-docx is installed.
"""

import json
import sys


def main() -> int:
    import docx
    from docx.shared import Pt

    source, target = sys.argv[1], sys.argv[2]
    with open(source, encoding="utf-8") as handle:
        data = json.load(handle)
    lesson = data.get("lesson", {})
    pages = data.get("pages", [])

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
