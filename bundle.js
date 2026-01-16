import { build } from 'esbuild'
import { writeFile, stat, readFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'

function formatSize(bytes) {
    return (bytes / 1024).toFixed(2) + ' KiB'
}

async function bundle(minify = false) {
    const outfile = minify ? `lib/bundle.min.js` : `lib/bundle.js`
    const typefile = minify ? `lib/bundle.min.d.ts` : `lib/bundle.d.ts`

    await build({
        entryPoints: ['src/index.ts'],
        bundle: true,
        format: 'esm',
        outfile,
        sourcemap: !minify,
        minify: minify,
    })
    const { size } = await stat(outfile)
    const gzipped = gzipSync(await readFile(outfile))
    console.log(`${outfile} size: ${formatSize(size)} (gzipped: ${formatSize(gzipped.length)})`)
    await writeFile(typefile, "export * from './index.js';")
    console.log(`Created typefile: ${typefile}`)
}

await Promise.all([
    bundle(false),
    bundle(true),
])
