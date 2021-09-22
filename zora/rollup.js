import node from '@rollup/plugin-node-resolve';
import cjs from '@rollup/plugin-commonjs';

export default {
  input: ['./src/index.js', './src/core.js'],
  output: {
    dir: './dist',
    format: 'es',
  },
  treeshake: {
    moduleSideEffects: false, // otherwise package 'diff' from 'zora-reporters' gets included
  },
  plugins: [node(), cjs()],
};
