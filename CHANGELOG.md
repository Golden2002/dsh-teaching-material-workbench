# Changelog

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
