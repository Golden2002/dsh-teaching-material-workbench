import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { draftPages, exportPages, listHistory, loadPages, restoreHistory, savePages } from '../lib/pages.js'

function writeCase() {
  const dir = mkdtempSync(join(tmpdir(), 'tmw-pages-'))
  mkdirSync(join(dir, 'build'), { recursive: true })
  writeFileSync(join(dir, 'lesson.yml'), 'id: fx\ntitle: 示例课\nduration_min: 20\nassessment:\n  type: 形成性\n  total_marks: 10\n')
  writeFileSync(join(dir, 'timeline.csv'), 'start,end,segment,teacher,student,output\n0,8,导入,展示两封邮件,投票选一封,投票结果\n8,20,练习,示范改写,独立改写,改写稿\n')
  return dir
}

test('draftPages maps one timeline segment to one page', () => {
  const dir = writeCase()
  try {
    const draft = draftPages(dir)
    assert.equal(draft.pages.length, 2)
    assert.equal(draft.pages[1].minutes, 12)
    assert.deepEqual(draft.pages[0].slide.bullets, ['展示两封邮件', '投票选一封'])
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('savePages writes pages.json, outline and a history version', () => {
  const dir = writeCase()
  try {
    const draft = draftPages(dir)
    const first = savePages(dir, draft.pages)
    assert.equal(first.revision, 1)
    assert.ok(existsSync(join(dir, 'pages.json')))
    assert.ok(existsSync(join(dir, 'build', 'outline.md')))
    assert.match(readFileSync(join(dir, 'build', 'outline.md'), 'utf8'), /第 1 页/)
    const second = savePages(dir, draft.pages, 1)
    assert.equal(second.revision, 2)
    assert.ok(listHistory(dir).length >= 2)
    assert.equal(loadPages(dir).revision, 2)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('savePages rejects a stale revision', () => {
  const dir = writeCase()
  try {
    savePages(dir, draftPages(dir).pages)
    assert.throws(() => savePages(dir, draftPages(dir).pages, 99), /revision conflict/)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('exportPages writes handout, deck, storyboard and Manim scripts', () => {
  const dir = writeCase()
  try {
    savePages(dir, draftPages(dir).pages)
    const result = exportPages(dir, ['handout', 'deck', 'storyboard', 'manim'])
    assert.ok(existsSync(join(dir, 'build', 'handout.md')))
    assert.ok(existsSync(join(dir, 'build', 'deck.md')))
    assert.ok(existsSync(join(dir, 'build', 'storyboard.md')))
    assert.ok(existsSync(join(dir, 'animations', 'Scene01.py')))
    assert.ok(result.artifacts.length >= 4)
    assert.match(readFileSync(join(dir, 'animations', 'Scene01.py'), 'utf8'), /class Scene01\(Scene\)/)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

function hasPythonDocumentHelpers() {
  const candidates = [process.env.PYTHON, 'python', 'py'].filter(Boolean)
  return candidates.some((candidate) => spawnSync(candidate, ['-c', 'import docx, pptx'], { timeout: 15000, windowsHide: true }).status === 0)
}

test('DOCX and PPTX export through optional Python helpers', { skip: !hasPythonDocumentHelpers() }, () => {
  const dir = writeCase()
  try {
    savePages(dir, draftPages(dir).pages)
    const result = exportPages(dir, ['docx', 'pptx'])
    assert.ok(existsSync(join(dir, 'build', 'handout.docx')))
    assert.ok(existsSync(join(dir, 'build', 'deck.pptx')))
    assert.equal(result.degraded_reason.length, 0)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('restoreHistory restores a saved version and backs up current state', () => {
  const dir = writeCase()
  try {
    const draft = draftPages(dir)
    const saved = savePages(dir, draft.pages)
    writeFileSync(join(dir, 'lesson.yml'), 'id: fx\ntitle: 被改坏的课\n')
    const result = restoreHistory(dir, saved.version_id)
    assert.ok(result.restored.includes('lesson.yml'))
    assert.match(readFileSync(join(dir, 'lesson.yml'), 'utf8'), /示例课/)
    assert.ok(result.backup_version)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})
