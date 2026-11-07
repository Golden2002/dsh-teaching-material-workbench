/** RFC 4180 CSV helpers. No dependencies. */

/**
 * Parse CSV text into rows of strings.
 * @param {string} text - CSV text.
 * @returns {string[][]} rows.
 */
export function parseCsv(text) {
  const source = String(text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i]
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          quoted = false
        }
      } else {
        field += ch
      }
      continue
    }
    if (ch === '"') {
      quoted = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((entry) => entry.some((cell) => cell.trim() !== ''))
}

/**
 * Parse CSV text with a header row into objects.
 * @param {string} text - CSV text.
 * @returns {{header: string[], rows: Array<Record<string,string>>}} parsed table.
 */
export function parseCsvTable(text) {
  const rows = parseCsv(text)
  if (rows.length === 0) return { header: [], rows: [] }
  const header = rows[0].map((cell) => cell.trim())
  const records = rows.slice(1).map((cells) => {
    const record = {}
    header.forEach((name, index) => {
      record[name] = cells[index] === undefined ? '' : cells[index].trim()
    })
    return record
  })
  return { header, rows: records }
}

/**
 * Serialize rows for a fixed header.
 * @param {string[]} header - column names.
 * @param {Array<Record<string, unknown>>} rows - records.
 * @returns {string} CSV text with trailing newline.
 */
export function stringifyCsv(header, rows) {
  const escape = (value) => {
    const text = value === undefined || value === null ? '' : String(value)
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
  }
  const lines = [header.map(escape).join(',')]
  for (const row of rows) lines.push(header.map((name) => escape(row[name])).join(','))
  return `${lines.join('\n')}\n`
}
