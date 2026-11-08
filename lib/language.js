/**
 * PAEG teaching-language checker (JS port).
 *
 * The rules, forbidden-word list and replacement table are copied from the
 * PAEG teaching-language skill (Golden2002, MIT):
 * https://github.com/Golden2002/paeg-teaching-language-skill
 *
 * Scope: enumerable problems only — forbidden wording, punctuation, number
 * format and a few register rules. Figurative language, sentence fluency and
 * terminology consistency still need human review.
 */

import { readFileSync } from 'node:fs'

const DATA = JSON.parse(readFileSync(new URL('./language-data.json', import.meta.url), 'utf8'))
const CJK = '\\u4e00-\\u9fff'
const CJK_ONLY = new RegExp(`[${CJK}]`)
const ASCII_ONLY = /^[\x00-\x7F\s]+$/
const IMPERATIVE_PATTERNS = [/^记住/, /^牢记/, /^先看/, /^再看/, /^看看/, /^注意背/, /^背下/, /^请记住/, /^务必记住/, /^首先要记住/]
const SECOND_PERSON_PATTERNS = [/你/, /您/, /咱们/]

/**
 * Check one text fragment.
 * @param {string} text - text to check.
 * @param {string} where - file:line or field path.
 * @param {'title'|'body'|'note'|'table'|'translation'|'formula'|'en'} [kind] - text role.
 * @returns {Array<{category:string, rule:string, where:string, hit:string, sample:string, advice:string}>} violations.
 */
export function checkText(text, where, kind = 'body') {
  const t = String(text ?? '')
  if (kind === 'en' || ASCII_ONLY.test(t.trim() || ' ')) return []
  const out = []
  const add = (category, rule, hit, advice) => out.push({ category, rule, where, hit, sample: t.slice(0, 80), advice })
  const rules = DATA.rules ?? {}

  for (const item of DATA.forbidden ?? []) {
    if (item.word && t.includes(item.word)) add('禁用词', `禁用词：${item.category ?? '口语化'}`, item.word, item.advice ?? '改为书面语表述')
  }

  if (rules.plus_as_conjunction !== false && kind !== 'formula' && kind !== 'translation') {
    const match = t.match(/\+/)
    if (match) {
      const index = match.index
      const left = t.slice(0, index).trimEnd()
      const right = t.slice(index + 1).trimStart()
      if (new RegExp(`[${CJK}]$`).test(left) && new RegExp(`^[${CJK}]`).test(right)) {
        add('标点', '并列词语之间使用加号', '+', '并列词语之间应当使用顿号或连词“与”')
      }
    }
  }

  if (rules.slash_as_conjunction !== false && kind !== 'formula' && kind !== 'translation') {
    const match = t.match(/[/／]/)
    if (match) {
      const index = match.index
      const left = t.slice(0, index).trimEnd()
      const right = t.slice(index + 1).trimStart()
      if (new RegExp(`[${CJK}]$`).test(left) && new RegExp(`^[${CJK}]`).test(right)) {
        add('标点', '并列词语之间使用斜杠', match[0], '并列词语之间应当使用顿号或连词“与”')
      }
    }
  }

  if (rules.halfwidth_punct !== false && kind !== 'formula') {
    const half = t.match(new RegExp(`[${CJK}][,;:?!]`)) ?? t.match(new RegExp(`[,;:?!][${CJK}]`))
    if (half) add('标点', '半角标点混入中文', half[0], '中文文本应当使用全角标点')
    if (new RegExp(`[${CJK}][()]`).test(t) || new RegExp(`[()][${CJK}]`).test(t)) {
      add('标点', '半角括号混入中文', '()', '中文文本应当使用全角括号')
    }
  }

  if (/…{2,}\s*等/.test(t)) add('标点', '省略号与“等”连用', '……等', '省略号与“等”二者保留其一')
  if (/——\s*(即|也就是)/.test(t)) add('标点', '破折号与“即”连用', '——即', '破折号与“即”二者保留其一')

  if (rules.level_number !== false) {
    const level = t.match(/第\s*[0-9]+\s*(讲|章|节|课)/)
    if (level) add('数字', '层级编号使用阿拉伯数字', level[0], '层级编号应当与上下文保持一致，教学材料通常使用汉字数字')
  }

  if (kind === 'title' && t.trim().endsWith('。')) add('标点', '标题末尾使用句号', '。', '标题与副标题末尾不加句号')

  if (kind === 'body' || kind === 'note') {
    for (const pattern of IMPERATIVE_PATTERNS) {
      const match = t.trim().match(pattern)
      if (match) {
        add('语体', '讲解使用祈使句', match[0], '讲解一律使用有主语的陈述句')
        break
      }
    }
    for (const pattern of SECOND_PERSON_PATTERNS) {
      const match = t.match(pattern)
      if (match) {
        add('语体', '讲解使用第二人称', match[0], '讲解中不使用第二人称，可用“学生”或“我们”')
        break
      }
    }
  }

  if (rules.max_sentence_length && kind === 'body') {
    const limit = Number(rules.max_sentence_length)
    for (const sentence of t.split(/[。！？；]/)) {
      let count = 0
      for (const char of sentence) if (char >= '\u4e00' && char <= '\u9fff') count += 1
      if (count > limit) {
        add('语体', '单句超过规定长度', `${count} 字`, `单个句子的汉字数一般不超过 ${limit} 字，建议拆分`)
        break
      }
    }
  }
  return out
}

/**
 * Check one Markdown or plain-text document line by line.
 * @param {string} name - file name used in `where`.
 * @param {string} text - file content.
 * @returns {Array<object>} violations.
 */
export function checkDocument(name, text) {
  const out = []
  String(text ?? '').split(/\r?\n/).forEach((line, index) => {
    if (!CJK_ONLY.test(line)) return
    const title = line.trimStart().startsWith('#')
    const body = title ? line.replace(/^#+\s*/, '') : line
    out.push(...checkText(body, `${name}:${index + 1}`, title ? 'title' : 'body'))
  })
  return out
}

/**
 * Apply the mechanical replacement table (longest source first).
 * @param {string} text - input text.
 * @returns {{text:string, changes:Array<{from:string,to:string,count:number}>}} result.
 */
export function applyReplacements(text) {
  let output = String(text ?? '')
  const changes = []
  const table = [...(DATA.replacements ?? [])].sort((a, b) => b.from.length - a.from.length)
  for (const item of table) {
    if (!item.from || item.from === item.to) continue
    const parts = output.split(item.from)
    const count = parts.length - 1
    if (count > 0) {
      output = parts.join(item.to)
      changes.push({ from: item.from, to: item.to, count })
    }
  }
  return { text: output, changes }
}

/**
 * Count violations by category.
 * @param {Array<object>} violations - checker output.
 * @returns {Record<string, number>} counts.
 */
export function summarize(violations) {
  const counts = {}
  for (const violation of violations) counts[violation.category] = (counts[violation.category] ?? 0) + 1
  return counts
}

/**
 * Structural metadata for the language rule set.
 * @returns {{version:string, source:string, forbidden:number, replacements:number, rules:object}} metadata.
 */
export function languageInfo() {
  return {
    version: DATA.version,
    source: DATA.source,
    forbidden: (DATA.forbidden ?? []).length,
    replacements: (DATA.replacements ?? []).length,
    rules: DATA.rules ?? {},
  }
}
