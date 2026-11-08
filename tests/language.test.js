import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyReplacements, checkDocument, checkText, languageInfo, summarize } from '../lib/language.js'

test('forbidden wording is reported with advice', () => {
  const violations = checkText('说白了，这里先看结论。', 'x.md:1')
  assert.ok(violations.some((item) => item.category === '禁用词' && item.hit === '说白了'))
})

test('half-width punctuation and plus/slash conjunctions are reported', () => {
  const violations = checkText('语法+词汇,读/写', 'x.md:1')
  const rules = violations.map((item) => item.rule)
  assert.ok(rules.includes('并列词语之间使用加号'))
  assert.ok(rules.includes('并列词语之间使用斜杠'))
  assert.ok(rules.includes('半角标点混入中文'))
})

test('register rules catch imperative, second person and long sentences', () => {
  const imperative = checkText('记住这个结论。', 'x.md:1')
  assert.ok(imperative.some((item) => item.rule === '讲解使用祈使句'))
  const second = checkText('你会发现这个规律。', 'x.md:1')
  assert.ok(second.some((item) => item.rule === '讲解使用第二人称'))
  const long = checkText('这句话故意写得很长'.repeat(6) + '。', 'x.md:1')
  assert.ok(long.some((item) => item.rule === '单句超过规定长度'))
})

test('title period and level numbers are reported', () => {
  const title = checkText('# 标题。', 'x.md:1', 'title')
  assert.ok(title.some((item) => item.rule === '标题末尾使用句号'))
  const level = checkText('第3章 开始', 'x.md:1')
  assert.ok(level.some((item) => item.rule === '层级编号使用阿拉伯数字'))
})

test('ellipsis with 等 and dash with 即 are reported', () => {
  const a = checkText('内容包括甲、乙……等。', 'x.md:1')
  assert.ok(a.some((item) => item.rule === '省略号与“等”连用'))
  const b = checkText('规则——即三条。', 'x.md:1')
  assert.ok(b.some((item) => item.rule === '破折号与“即”连用'))
})

test('English-only text is skipped', () => {
  assert.equal(checkText('This is an English sentence.', 'x.md:1').length, 0)
})

test('document checks report file:line and counts', () => {
  const violations = checkDocument('lesson.md', '# 标题。\n\n说白了，先看这里。')
  assert.ok(violations.some((item) => item.where === 'lesson.md:3'))
  assert.ok(Object.keys(summarize(violations)).length >= 1)
})

test('mechanical replacements are previewed', () => {
  const result = applyReplacements('把这个搞定，先记住要点。')
  assert.equal(result.changes.length, 2)
  assert.match(result.text, /完成/)
  assert.match(result.text, /掌握/)
})

test('language metadata exposes source and rule counts', () => {
  const info = languageInfo()
  assert.ok(info.forbidden > 20)
  assert.ok(info.replacements >= 10)
  assert.match(info.source, /PAEG/)
})
