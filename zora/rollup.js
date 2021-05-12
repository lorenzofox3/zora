import node from '@rollup/plugin-node-resolve';
import cjs from '@rollup/plugin-commonjs';

export default {
  input: './src/index.js',
  output: [
    {
      file: './dist/index.cjs',
      format: 'cjs',
    },
    {
      file: './dist/index.js',
      format: 'es',
    },
  ],
  plugins: [node(), cjs()],
};
