# Changelog

## 0.5.0 — 2026-11-08

- Add the `来源` tab and structured sources API: edit `sources.csv` as cards (id/title/publisher/date/type/locator/access/license/verified/role), see verified/primary/restricted counts, add/delete rows.
- Add sentence-level ungrounded hints in `逐页`: substantive handout sentences without `[Sxx]` are listed; choose a source to append its marker to that sentence.
- Add version diff: history entries can open a side-by-side view of that version's `pages.json` and the current file.
- Improve preview: a 16:9 slide card plus a handout card, with an explicit "approximate, export for final layout" note.
- Record the Manim user note in `docs/MEDIA-PIPELINE.md`: no venv, no install; script-only, render by the teacher externally.

## 0.4.2 — 2026-11-08

- Manim scene scripts now declare `FONT = "Noto Sans SC"` with a note to change it when that font is absent; generated text passes `font=FONT`.
- Correct the Manim degraded reason: ffmpeg may exist through `imageio-ffmpeg`, so the message no longer claims video synthesis is impossible, only that the plugin does not embed it.
- Include the final `docs/MEDIA-PIPELINE.md` research report from the media-engineer agent.

## 0.4.1 — 2026-11-08

- Export now writes `build/script.md` (narration script) and `build/subtitles.srt` (one cue per page, timed from page minutes) alongside the storyboard, for the "video/animation scripts only, no rendering" workflow.
- Commit the two research reports produced for this iteration: `docs/TEACHER-NEEDS.md` (teacher first-person, evidence S01–S16) and `docs/MEDIA-PIPELINE.md` (local toolchain tests, routes, risks).

## 0.4.0 — 2026-11-08

- Add the page model: `pages.json`, one timeline segment per page, with slide bullets, handout paragraphs, task, notes and sources; saving regenerates `build/outline.md` and creates a history version (`teaching_material_pages`).
- Add the Web UI tabs: `逐页` (page list, per-page fields, approximate preview), `数据文件`, `检查中心` (gate + language + grounding + sources in one view) and `版本回退` (list and restore `.history/`).
- Add export (`teaching_material_export`): handout Markdown, deck Markdown, storyboard, per-page Manim scene scripts; optional DOCX/PPTX through local python-docx/python-pptx with an explicit degraded reason when missing.
- Add API routes for pages, export, checks and history; tests now 38, including page drafts, revision conflicts, export outputs and history restore.
- Add `docs/TEACHER-NEEDS.md`, `docs/MEDIA-PIPELINE.md`; the product design in `docs/FEATURE-DESIGN.md` marks the P0 subset implemented here.

## 0.3.1 — 2026-11-08

- Fix the `teaching_language_check` output schema: `counts.additionalProperties` must be a boolean; use an open object schema instead. The activation guard now rejects object-valued `additionalProperties` anywhere in a tool schema, with a regression test.
- 0.3.0 failed to activate because of this schema; 0.3.1 is the installable release.

## 0.3.0 — 2026-11-08

- Add a Web UI tab `教学物料` (`conversation.view`): browse case directories, edit lesson/profile/CSV/claims/knowledge/teacher-pack/outline, run language checks and gates, see results in place. Host API under `/teaching-workbench`.
- Add PAEG teaching-language integration: `lib/language.js`, bundled rule data, `teaching_language_check` tool, `E2-language-paeg` gate for `language.md`, and `docs/LANGUAGE.md` plus the upstream rule documents with attribution.
- Add optional `language.md` to the scaffold; existing cases without it report the gate as unexecuted.
- Tests: 32 passing, including language rules and the new gate.

## 0.2.4 — 2026-11-07

- Release packaging: version 0.2.4, real `publishTimestamp` in the community index example.
- Add `PUBLISHING.md` (channels, blockers, exact commands) and `community/validate-index.mjs` (format-1 checks runnable without the app.asar copy).
- README gains a further-reading section; docs list the final compliance and benchmark documents.
- No runtime behaviour change from 0.2.3.

## 0.2.3 — 2026-11-07

- Fix the stale "five tools" header comment and the `checkRights` formatting defect.
- Package `tests/` so `node --test tests/*.test.js` runs from the installed package too.
- Add an end-to-end test that drives every tool's `execute` entry point.
- Refresh `package.json` and locale descriptions for grounding, knowledge map and outline.
- Update `docs/COMPLIANCE.md` with the 0.2.x additions; final packaged copy includes `docs/BENCHMARK.md`, `docs/REUSE.md`, `docs/COMPLIANCE-REVIEW.md` and the current `community/index.example.json` (0.2.3).

## 0.2.2 — 2026-11-07

- Add `verification/trial-design.template.md` and enforce it: pilot data without a written design fails E3-pilot; a design without data stays unexecuted.
- Extend source roles with `exercise`, `slides`, `case`, `lecture` without changing the CSV header, so old cases keep working.
- Tests for the pilot/design rule.

## 0.2.1 — 2026-11-07

- Incorporate the Tsinghua research P0 items: optional `knowledge.csv` concept map with a new `E2-knowledge` gate; coarse-locator detection in the grounding audit; stronger E3-pilot check that rejects an unfilled template.
- Single-blind fields in the pilot and peer-review templates.
- Outline now includes the profile context and the knowledge map section.
- Tests cover coarse locators, invalid knowledge rows and unfilled pilot data.

## 0.2.0 — 2026-11-07

- Add `teaching_material_ground`: claim-level grounding audit (`claims.csv` + `[Sxx]` markers), the knowledge-base contract borrowed from retrieval-grounded teaching assistants.
- Add `teaching_material_outline`: deterministic slide outline from lesson/timeline/rubric/glossary/sources, so deck production has one structured source.
- Gate: new `E2-grounding` check. A missing `claims.csv` is reported as unexecuted, not failed, so older cases keep working.
- Scaffold now includes `claims.csv` and updated next steps.
- Skill, README and tests updated.

## 0.1.1 — 2026-11-07

- Fix a fatal model-facing schema defect: `required: true` had been written into property schemas, so the function validator rejected `teaching_material_audit` (and the other tools) with `Invalid schema ... true is not of type 'array'`.
- Add `assertToolSchema` as an activation-time guard and a regression test that rejects property-level `required`.
- Keep object-level `required` arrays for every tool.

## 0.1.0 — 2026-11-07

- First release.
- Host bundle with five tools: scaffold a case, run layered gates, audit sources and rights, hash artifacts, list the standards register.
- Runtime skill `teaching-material-workbench` registered through the Host skills service.
- Zero runtime dependencies; no install scripts, no network access, no telemetry.
- Tests under `node --test`.
- Community index entry example and publication checklist.
