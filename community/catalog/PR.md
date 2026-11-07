# 社区目录 PR 提交材料

## 一键提交

<https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/compare/main...Golden2002:add-dsh-teaching-material-workbench?expand=1>

## 标题

```text
Add Golden2002/dsh-teaching-material-workbench
```

## 正文

```markdown
- [x] I added **one file** at `data/plugins/Golden2002__dsh-teaching-material-workbench.yml` — that single file is the whole submission.
- [x] My repo's `package.json` declares **`dsh.bundle`** (`dsh.bundle.patch: ./cordis.patch.yml`; Host-only plugin, no `dsh.client`).
- [ ] My repo is at least **1 day old** — created 2026-11-07T08:24:25Z, so this is the only failing gate. Per the CI note it re-runs by itself and should clear in about 24h; no resubmission needed.
- [x] `category: workflow` — the plugin is a production workflow for teaching materials.
- [x] Description states what the plugin does, no superlatives.
- [x] My repo has the `dsh-plugin` topic.

The plugin makes the evidence chain of a teaching-material case executable: it scaffolds a case (context profile, lesson data, source and claim registers), audits claim-level grounding and a concept map (`claims.csv`, `knowledge.csv`), generates a deterministic slide outline, runs E1 self-consistency, E2 external-standard and E3 empirical gates (15 checks), audits rights, and hashes build artifacts. It ships 7 Host tools, 22 tests, no runtime dependencies, no network access and no telemetry. Install with `plugin_manager action=install_bundle target=git+https://github.com/Golden2002/dsh-teaching-material-workbench.git#7b805288da07a1985157948f35feb940179bb384`.
```
