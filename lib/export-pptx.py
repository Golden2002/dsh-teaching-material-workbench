"""Minimal PPTX export for dsh-teaching-material-workbench.

Reads an export JSON ({lesson, pages}) and writes a plain 16:9 deck.
Optional external helper: only runs when python-pptx is installed.
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
    from pptx import Presentation
    from pptx.util import Inches, Pt

    source, target = sys.argv[1], sys.argv[2]
    with open(source, encoding="utf-8") as handle:
        data = json.load(handle)
    lesson = data.get("lesson", {})
    pages = data.get("pages", [])
    base_dir = data.get("dir")

    deck = Presentation()
    deck.slide_width = Inches(13.333)
    deck.slide_height = Inches(7.5)
    title_slide = deck.slides.add_slide(deck.slide_layouts[0])
    title_slide.shapes.title.text = str(lesson.get("title") or "课件")
    title_slide.placeholders[1].text = f"{lesson.get('duration_min', '')} 分钟"

    for index, page in enumerate(pages, start=1):
        slide = deck.slides.add_slide(deck.slide_layouts[1])
        slide.shapes.title.text = str(page.get("title") or f"第 {index} 页")
        body = slide.placeholders[1].text_frame
        bullets = page.get("slide", {}).get("bullets") or []
        body.clear()
        for bullet_index, bullet in enumerate(bullets[:6]):
            paragraph = body.paragraphs[0] if bullet_index == 0 else body.add_paragraph()
            paragraph.text = str(bullet)
            paragraph.font.size = Pt(24)
        notes = page.get("notes")
        if notes:
            slide.notes_slide.notes_text_frame.text = str(notes)
        visual = page.get("slide", {}).get("visual") or {}
        image_path = safe_asset(base_dir, visual.get("asset"))
        if image_path:
            slide.shapes.add_picture(image_path, Inches(0.8), Inches(4.4), width=Inches(6.2))
            caption = visual.get("caption") or visual.get("alt") or ""
            source_id = visual.get("source") or ""
            if caption or source_id:
                box = slide.shapes.add_textbox(Inches(0.8), Inches(6.9), Inches(11), Inches(0.4))
                box.text_frame.text = f"图注：{caption}{f' [{source_id}]' if source_id else ''}"

    deck.save(target)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
