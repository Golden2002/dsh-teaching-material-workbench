#!/usr/bin/env node
/**
 * Format-1 community index validator for this package.
 *
 * The official validator lives in the Electron app.asar and cannot be imported
 * by Node; this script applies the same rules that the shipped validator checks
 * (format, localized titles, npm package name, exact SemVer, integer
 * publishTimestamp, npm/git source, engines.dsh range). It is a pre-submission
 * check, not a replacement for the official function.
 *
 * Usage: node community/validate-index.mjs community/index.example.json
 */

import { readFileSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SEMVER = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/
const PACKAGE_NAME = /^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/
const COMMIT = /^[0-9a-f]{40}$/
const RANGE_PART = /^(?:\^|~|>=|<=|>|<|=)?\s*(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/

function localized(value, path, errors) {
  if (typeof value === 'string' && value.trim()) return
  if (value && typeof value === 'object' && typeof value.en === 'string' && value.en.trim()) return
  errors.push(`${path} must be a non-empty string or a localized object with en`)
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url))
  const arg = process.argv[2]
  if (!arg) {
    console.error('usage: node community/validate-index.mjs <index.json>')
    process.exit(2)
  }
  const file = isAbsolute(arg) ? arg : resolve(process.cwd(), arg)
  const errors = []
  let doc
  try {
    doc = JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    console.log(JSON.stringify({ ok: false, file, errors: [`JSON parse: ${error.message}`] }, null, 2))
    process.exit(1)
  }
  if (doc.format !== 1) errors.push('$.format must be 1')
  localized(doc.title, '$.title', errors)
  if (!Array.isArray(doc.plugins) || doc.plugins.length === 0) errors.push('$.plugins must be a non-empty array')
  for (const [index, plugin] of (doc.plugins ?? []).entries()) {
    const at = `$.plugins[${index}]`
    if (typeof plugin.name !== 'string' || !PACKAGE_NAME.test(plugin.name)) errors.push(`${at}.name must be a valid npm package name`)
    localized(plugin.title, `${at}.title`, errors)
    localized(plugin.description, `${at}.description`, errors)
    if (!Array.isArray(plugin.versions) || plugin.versions.length === 0) errors.push(`${at}.versions must be a non-empty array`)
    for (const [versionIndex, version] of (plugin.versions ?? []).entries()) {
      const vat = `${at}.versions[${versionIndex}]`
      if (!SEMVER.test(String(version.version ?? ''))) errors.push(`${vat}.version must be exact SemVer`)
      if (!Number.isInteger(version.publishTimestamp) || version.publishTimestamp < 0 || version.publishTimestamp >= 1e11) {
        errors.push(`${vat}.publishTimestamp must be an integer Unix time in [0, 1e11)`)
      }
      const source = version.source
      if (!source || (source.type !== 'npm' && source.type !== 'git')) errors.push(`${vat}.source.type must be npm or git`)
      else if (source.type === 'git') {
        if (typeof source.url !== 'string' || !/^https:\/\/[^/]+\/.+\/.+\.git$/.test(source.url)) errors.push(`${vat}.source.url must be canonical https git URL`)
        if (!COMMIT.test(String(source.commit ?? ''))) errors.push(`${vat}.source.commit must be 40 lowercase hex`)
      }
      const range = version.engines?.dsh
      if (range !== undefined) {
        const parts = String(range).split(/\s+/).filter(Boolean)
        if (parts.length === 0 || !parts.every((part) => RANGE_PART.test(part))) errors.push(`${vat}.engines.dsh must be a SemVer range`)
      }
    }
  }
  console.log(JSON.stringify({ ok: errors.length === 0, file, errors }, null, 2))
  process.exit(errors.length === 0 ? 0 : 1)
}

main()
