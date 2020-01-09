import { terser } from 'rollup-plugin-terser'
import gzipPlugin from 'rollup-plugin-gzip'

module.exports = {
  input: 'index.js',
  plugins: [
    terser({ include: ['jj.min.js', 'esm'] }),
    gzipPlugin()
  ],
  output: [
    {
      compact: false,
      indent: false,
      file: 'dist/jj.js',
      format: 'esm'
    },
    {
      compact: true,
      indent: false,
      sourcemap: true,
      file: 'dist/jj.min.js',
      format: 'esm'
    },
  ]
};