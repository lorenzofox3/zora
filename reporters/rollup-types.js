import dts from 'rollup-plugin-dts';

export default {
  input: 'src/types/index.d.ts',
  output: [{
    file: 'dist/index.d.ts',
    format: 'es',
  }, {
    file: 'dist/index.d.cts',
    format: 'cjs'
  }],
  plugins: [dts()],
};
