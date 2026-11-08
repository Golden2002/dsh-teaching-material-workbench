import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createCase } from '../lib/wizard.js'

test('createCase writes a complete case scaffold with sources and timeline', () => {
  const root = join(mkdtempSync(join(tmpdir(), 'tmw-wizard-')), 'demo')
  try {
    const result = createCase(root, {
      title: '现在进行时试讲',
      subject: '英语',
      level: '初中',
      audience: '八年级学生',
      setting: '现场授课',
      duration_min: 20,
      sources: [{ id: 'S01', title: '课标', publisher: '教育部', locator: '第 12 页', license: 'official', verified: 'yes', type: 'primary' }],
      timeline: [{ start: '0', end: '10', segment: '导入', teacher: '展示图片', student: '描述动作', output: '口头句' }],
    })
    assert.equal(result.ok, true)
    assert.ok(existsSync(join(root, 'lesson.yml')))
    assert.ok(existsSync(join(root, 'verification', 'peer-review.template.md')))
    const sources = readFileSync(join(root, 'sources.csv'), 'utf8')
    assert.match(sources, /S01/)
    const timeline = readFileSync(join(root, 'timeline.csv'), 'utf8')
    assert.match(timeline, /导入/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('createCase refuses to overwrite an existing case', () => {
  const root = join(mkdtempSync(join(tmpdir(), 'tmw-wizard-')), 'demo')
  try {
    createCase(root, { title: '第一版' })
    assert.throws(() => createCase(root, { title: '第二版' }), /already exists/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
