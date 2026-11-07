# Community index entry

`index.example.json` is a valid format-1 plugin market index document for this package. It follows the validator rules in `@deepseek-ai/dsh-plugin-market-index`:

- `format: 1`
- index-level `title` and `description` as localized objects with `en`
- each plugin: npm package name, localized title/description, optional `metadata.keywords`, and a non-empty `versions` array
- each version: exact SemVer, integer `publishTimestamp` in Unix seconds, `source` (`npm` or `git`), optional `engines.dsh`

## Publish checklist

A package cannot be listed until it exists somewhere installable.

1. Choose the distribution channel:
   - npm: `npm publish` this package, then keep `source.type: "npm"`.
   - Git: push a public HTTPS repository, set `source.type: "git"`, the canonical repository URL, the 40-hex commit SHA, and `path` when the package is not at the repository root.
2. Replace `publishTimestamp` with the real publish time in Unix seconds.
3. Optionally add `homepage`, `repository`, `author` and `icon` (HTTPS URL or the index origin). Do not add credentials, queries or fragments to URLs.
4. Validate with:

   ```js
   import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index'
   parseMarketIndex(JSON.parse(readFileSync('index.json', 'utf8')), 'https://example.com/index.json')
   ```

5. Submit the index document to the community index maintainer. The index is a claim; the installed package manifest decides what is installed.

## Notes

- The example uses `source.type: "npm"` because the package is not published in this workspace. Update it before submitting.
- The example intentionally omits `icon`, `homepage` and `repository`, which are optional; add real URLs rather than placeholders.
