# dsh-teaching-material-workbench

Evidence-gated teaching-material production for DeepSeek Harness. It scaffolds a case, binds primary sources, runs layered gates, audits rights, and records artifact hashes. The core is subject- and setting-agnostic; subject content lives only in the case directory.

按证据链生产教学物料的 DeepSeek Harness 插件：建立案例、绑定一手材料、跑三层门禁、审计版权、记录产物哈希。核心与学科、学段、场景无关，学科内容只放在案例目录里。

## What it adds

| Tool | Purpose |
|---|---|
| `teaching_material_init` | Create a case scaffold: context profile, lesson data, source and claim registers, alignment, rubric, timeline, glossary, misconceptions, palette, teacher pack, verification templates. |
| `teaching_material_gate` | Run E1 (self-consistency), E2 (external standards) and E3 (empirical evidence) gates; write `gate-report.md`. |
| `teaching_material_ground` | Claim-level grounding audit: each claim needs a source and a locator; unsupported claims fail; the teacher pack needs `[Sxx]` markers. Writes `verification/grounding-report.md`. |
| `teaching_material_outline` | Generate a deterministic slide-by-slide Markdown outline from the case data; writes `build/outline.md`. |
| `teaching_material_audit` | Audit the source register and rights; write `verification/rights-report.md`. |
| `teaching_material_repro` | SHA-256 every build artifact; write `verification/repro.json`. |
| `teaching_material_standards` | Return the external standards register with an honest `verified` / `partial` / `not-obtained` status. |

A runtime skill `teaching-material-workbench` teaches the agent the workflow and the evidence rules.

## Install

The plugin is a Host-only bundle. Do not edit the profile files by hand.

```text
# From the Web UI: Plugins → Install → point at the package directory
# Or from an agent session:
plugin_manager action=install_bundle target=<absolute package directory>
```

CLI equivalent: `dsh plugin --profile <name> add <absolute package directory>`.

Requirements: DeepSeek Harness with Host `tools` service (current profiles), Node.js ≥ 20. The package declares `engines.dsh >=0.2.2-rc.1`, has no install scripts, no build step, no runtime dependencies, and makes no network requests.

## Quick start

1. Ask the agent to create a case:

   ```text
   teaching_material_init directory=D:\work\case-001 title=... subject=... level=... audience=... setting=...
   ```

2. Fill `profile.yml` (authorities, thresholds) and the CSV files. Every source needs publisher, date, locator, access, licence and verification status. Secondary material may only locate primary material. `claims.csv` carries one row per substantive claim (`claim`, `source_id`, `locator`, `supported|partial|unsupported`); optional `knowledge.csv` maps key concepts to the same source and locator.
3. Run `teaching_material_ground`; remove or fix unsupported claims.
4. Generate `build/outline.md` with `teaching_material_outline`, then produce `build/deck.pptx` / `build/handout.docx` with any tool and write `teacher-pack.md` with `[Sxx]` citations.
5. Run `teaching_material_gate`. Fix the data, never loosen the gate.
6. Run `teaching_material_audit` and `teaching_material_repro`.
7. Add human review and pilot evidence when available: write `verification/trial-design.md` before filling `pilot.csv`, and keep both marked "未执行" when not done. An empty pilot template fails the gate; pilot data without a written design also fails.

## Gate layers

| Layer | Meaning | Examples |
|---|---|---|
| E1 | Self-consistency: structure, arithmetic, cross-file references | schema, timeline sum, rubric total, source ids exist |
| E2 | External standards and documents | source register rules, official mark scheme, WCAG 2.2 SC 1.1.1/1.4.3, GB/T 15834, licence terms |
| E3 | External empirical evidence | independent peer review, learner pilot data |

Each gate carries its layer and its basis. A `skip` means the check did not run; it never counts as a pass.

## Verification

```bash
node --test tests/*.test.js
```

## Scope and limits

- Data-level gates. Typography, render and overflow checks for the generated deck/handout still need the material tool (for example LibreOffice rendering) and are not claimed here.
- E3 gates only check that evidence exists; they do not judge its quality.
- No network, no telemetry, no student data collection. Case data stays in the directory you choose.
- The standards register states `not-obtained` where the text could not be obtained; do not cite those clauses.

## Community package compliance

See [docs/COMPLIANCE.md](docs/COMPLIANCE.md) and [community/README.md](community/README.md). The package follows the Host bundle conventions: `dsh.bundle.patch`, exported locale files with `meta.title` / `meta.description` in English and Chinese, an original SVG icon inside the package, an explicit `files` list, `engines.dsh`, no install scripts, and MIT licence.

## Further reading

- [docs/BENCHMARK.md](docs/BENCHMARK.md) — capability comparison and the four measurable indicators, with current values.
- [docs/TSINGHUA-INTEGRATION.md](docs/TSINGHUA-INTEGRATION.md) — Tsinghua educational-agent research, licence resolution, and which capabilities were adopted.
- [docs/REUSE.md](docs/REUSE.md) — what was reused from the DSH Host bundle spec, `dsh-memory-evolve`, the Python workbench, DSH skills and external standards.
- [docs/COMPLIANCE-REVIEW.md](docs/COMPLIANCE-REVIEW.md) — 21-item compliance review against the official bundle and index rules.
- `verification/plugin-acceptance.md` and `verification/final-check-0.2.3.md` — independent acceptance and final install check (source repository only; not packaged).

## Licence

MIT.
