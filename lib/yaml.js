/**
 * Minimal YAML reader for the workbench's own template subset.
 *
 * Supported: comments, mappings, block lists, inline lists, quoted scalars,
 * numbers, booleans, null. Not supported: anchors, tags, multi-line scalars,
 * flow mappings. This is deliberate: the plugin has no runtime dependencies
 * and only reads files it or the user authored in this subset.
 */

function stripComment(text) {
  let quote = null
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (quote) {
      if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (ch === '#' && (i === 0 || /\s/.test(text[i - 1]))) return text.slice(0, i)
  }
  return text
}

function parseScalar(raw) {
  let text = stripComment(raw).trim()
  if (text === '') return null
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1)
  }
  if (text.startsWith('[') && text.endsWith(']')) {
    const inner = text.slice(1, -1).trim()
    if (inner === '') return []
    return inner.split(',').map((item) => parseScalar(item))
  }
  if (text === 'true') return true
  if (text === 'false') return false
  if (text === 'null' || text === '~') return null
  if (/^-?\d+(?:\.\d+)?$/.test(text)) return Number(text)
  return text
}

function splitKey(content) {
  const index = content.indexOf(':')
  if (index === -1) return null
  const key = content.slice(0, index).trim()
  if (!key || /\s/.test(key)) return null
  return { key, rest: content.slice(index + 1).trim() }
}

function isListLine(line) {
  return line.content === '-' || line.content.startsWith('- ')
}

function parseMap(lines, start, indent) {
  const result = {}
  let i = start
  while (i < lines.length && lines[i].indent === indent && !isListLine(lines[i])) {
    const pair = splitKey(lines[i].content)
    if (!pair) throw new Error(`line ${lines[i].n}: expected "key: value"`)
    i += 1
    if (pair.rest === '') {
      if (i < lines.length && lines[i].indent > indent) {
        const [value, next] = parseBlock(lines, i, lines[i].indent)
        result[pair.key] = value
        i = next
      } else {
        result[pair.key] = null
      }
    } else {
      result[pair.key] = parseScalar(pair.rest)
    }
  }
  return [result, i]
}

function parseList(lines, start, indent) {
  const result = []
  let i = start
  while (i < lines.length && lines[i].indent === indent && isListLine(lines[i])) {
    const line = lines[i]
    const rest = line.content === '-' ? '' : line.content.slice(2).trim()
    i += 1
    if (rest === '') {
      if (i < lines.length && lines[i].indent > indent) {
        const [value, next] = parseBlock(lines, i, lines[i].indent)
        result.push(value)
        i = next
      } else {
        result.push(null)
      }
      continue
    }
    const pair = splitKey(rest)
    if (!pair) {
      result.push(parseScalar(rest))
      continue
    }
    // Inline mapping item: treat the rest as the first line of a mapping and
    // consume following deeper lines as its continuation.
    const itemIndent = indent + 2
    const itemLines = [{ indent: itemIndent, content: rest, n: line.n }]
    let j = i
    while (j < lines.length && lines[j].indent > indent) {
      itemLines.push({ indent: Math.max(itemIndent, lines[j].indent), content: lines[j].content, n: lines[j].n })
      j += 1
    }
    const [value] = parseMap(itemLines, 0, itemIndent)
    result.push(value)
    i = j
  }
  return [result, i]
}

function parseBlock(lines, start, indent) {
  return isListLine(lines[start]) ? parseList(lines, start, indent) : parseMap(lines, start, indent)
}

/**
 * Parse a YAML document in the supported subset.
 * @param {string} text - YAML text.
 * @returns {unknown} parsed value.
 */
export function parseYaml(text) {
  const raw = String(text).replace(/\r\n?/g, '\n').split('\n')
  const lines = []
  raw.forEach((line, index) => {
    if (line.trim() === '') return
    const indent = line.match(/^ */)[0].length
    const content = line.slice(indent)
    if (content.startsWith('#')) return
    lines.push({ indent, content, n: index + 1 })
  })
  if (lines.length === 0) return null
  const [value, next] = parseBlock(lines, 0, lines[0].indent)
  if (next !== lines.length) throw new Error(`line ${lines[next].n}: unexpected indentation`)
  return value
}
