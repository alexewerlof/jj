import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

test('examples/index.json contains valid entries', async () => {
    // Resolve paths relative to this test file
    const examplesDir = dirname(fileURLToPath(import.meta.url))
    const indexPath = import.meta.resolve('./index.json')
    const indexFilePath = fileURLToPath(indexPath)
    const indexContent = await import(indexFilePath, { with: { type: 'json' } })
    const indexData = indexContent.default

    // Read actual directories in www/examples
    const actualFolders = readdirSync(examplesDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .sort()

    // Get keys from index.json
    const indexedFolders = Object.keys(indexData).sort()

    // Check that all index entries correspond to actual folders
    for (const folder of indexedFolders) {
        assert.ok(
            actualFolders.includes(folder),
            `Entry "${folder}" in index.json does not correspond to a folder in www/examples/`,
        )
    }

    // Check that all actual folders have corresponding index entries
    for (const folder of actualFolders) {
        // Skip hidden files and files that start with a dot
        if (folder.startsWith('.')) continue

        assert.ok(indexedFolders.includes(folder), `Folder "${folder}" in www/examples/ is not listed in index.json`)
    }

    // Check that all values are non-empty strings
    for (const [folder, description] of Object.entries(indexData)) {
        assert.strictEqual(
            typeof description,
            'string',
            `Description for "${folder}" should be a string, got ${typeof description}`,
        )
        assert.ok((description as string).trim().length > 0, `Description for "${folder}" should not be empty`)
    }
})
