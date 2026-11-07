# Official community requirements — compliance

This document maps the package to the DeepSeek Harness plugin requirements that apply to a community Host bundle. Sources: the `cordis-plugin-development` skill's `references/host-plugin.md`, the `plugin_manager` service documentation, and the plugin market index format 1 validator (`@deepseek-ai/dsh-plugin-market-index`).

## 1. Bundle manifest

- `package.json` declares `dsh.bundle.patch` → `./cordis.patch.yml`. ✅
- The patch inserts exactly one row: `id: teaching-material-workbench`, `name: dsh-teaching-material-workbench`. ✅
- No `postinstall` / `prepare` scripts. ✅
- No build step; `lib/` ships plain ESM. ✅
- `engines.dsh` declares the supported runtime range. ✅

## 2. Host export form

- `lib/index.js` exports `apply(ctx)` and `inject = ['tools']`. ✅
- Every registration is wrapped in `ctx.effect(...)` and is disposed on unload. ✅
- The optional skills registration goes through `ctx.get('skills')` and degrades silently when the service is absent. ✅

## 3. Display metadata and icon

- `locale/en.json` and `locale/zh.json` export `meta.title` and `meta.description` for the plugin row. ✅
- `package.json` exports `./locale/*.json` and `./icon`. ✅
- `icon.svg` is original artwork created for this package, under the package's MIT licence; it stays inside the package and is well below the 256 KiB limit. ✅
- `files` lists every runtime file plus locales, icon, patch, docs and community assets. ✅

## 4. Installation and profile safety

- Installation goes through `plugin_manager install_bundle` / `dsh plugin add`. The package never writes the profile's `package.json`, `cordis.patch.yml`, or `pnpm-workspace.yaml`. ✅
- No secrets, credentials or personal data are read or stored. ✅

## 5. Compatibility

- `engines.dsh`: `>=0.2.2-rc.1` — tested against DeepSeek Harness 0.2.2-rc.1. ✅
- Node.js ≥ 20 (uses `node:test`, `node:crypto`, ESM). ✅
- No DSH peer packages are imported at runtime; the plugin talks to the Host only through `ctx.tools` and optional `ctx.get('skills')`. ✅

## 6. Privacy and network

- No network requests at install time or run time. ✅
- No telemetry. ✅
- Case data stays in the directory the user passes. ✅

## 7. Quality evidence

- Tests: `node --test tests/*.test.js` covers YAML/CSV parsing, contrast ratio, language rules, a full passing fixture and failing cases. ✅
- `CHANGELOG.md` records the release. ✅
- `README.md` documents install, tools, gate layers and limits. ✅
- MIT licence. ✅

## 8. Community index (format 1)

`community/index.example.json` is a valid format-1 index entry for this package. It uses `source.type: "npm"` with the version that would be published. Publication is intentionally not performed by this repository, because it needs a public repository, an npm publish and the index maintainer's review.

Steps left for a publisher:

1. Publish the package to npm (`npm publish`) or push the repository.
2. For npm: keep `source.type: "npm"`; for Git: set `source.type: "git"`, the canonical HTTPS repository URL, the commit SHA, and optionally `path` when the package is not at the repository root.
3. Set the real `publishTimestamp` (Unix seconds) and, when a custom host serves the index, put the icon URL behind HTTPS.
4. Validate the document with `parseMarketIndex` from `@deepseek-ai/dsh-plugin-market-index` before submitting.
5. Submit the index entry to the community index maintainer.

## 9. Not claimed

- The plugin is not an official DeepSeek bundle; it is a community package.
- The plugin does not render a Web UI panel. Its user surface is the Host tool set, the registered skill and the files it writes.

## 10. 0.2.x additions

The 0.1.x checklist above still holds. Since 0.2.0 the package also ships:

- **Seven tools**: `teaching_material_init`, `gate`, `ground`, `outline`, `audit`, `repro`, `standards`.
- **Claim-level grounding**: `claims.csv` + `E2-grounding`; unsupported claims fail; coarse locators (`p.`, `全书`, `网络`, …) fail.
- **Knowledge map**: optional `knowledge.csv` + `E2-knowledge`; missing file is reported as unexecuted, not failed.
- **Deterministic outline**: `teaching_material_outline` writes `build/outline.md` from lesson, timeline, rubric, glossary, sources and knowledge data.
- **Pilot design gate**: `verification/trial-design.template.md`; pilot data without a written design fails E3-pilot, a design without data stays unexecuted, an unfilled pilot template fails.
- **Source roles**: `exercise`, `slides`, `case`, `lecture` added without changing the CSV header.
- **Tests ship with the package**: `tests/` is in `files`, so `node --test tests/*.test.js` runs from the installed package.
- **`verification/` is intentionally not packaged**: acceptance evidence and case data stay in the source repository; the installed package contains only runtime files, docs, tests and the community index example.

The authoritative, evidence-by-evidence compliance review is [`COMPLIANCE-REVIEW.md`](COMPLIANCE-REVIEW.md). The comparative capability matrix is [`BENCHMARK.md`](BENCHMARK.md); the reuse register is [`REUSE.md`](REUSE.md); the Tsinghua integration study is [`TSINGHUA-INTEGRATION.md`](TSINGHUA-INTEGRATION.md).
- Gate results are evidence about the case data, not a guarantee that the lesson teaches well.
