import { defineConfig, type Options } from 'tsup'

const baseConfig: Omit<Options, 'entry' | 'minify'> = {
    format: ['esm', 'iife', 'cjs'],
    bundle: true,
    outDir: 'lib',
    dts: true,
    sourcemap: true,
    noExternal: ['jty'],
}

export default defineConfig([
    {
        entry: { bundle: 'src/index.ts' },
        minify: false,
        ...baseConfig,
    },
    {
        entry: { 'bundle.min': 'src/index.ts' },
        minify: true,
        ...baseConfig,
    },
])
