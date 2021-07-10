import dts from 'rollup-plugin-dts';

export default {
  input: 'src/types/index.d.ts',
  output: {
    file: 'dist/zora-reporters.d.ts',
    format: 'es',
  },
  plugins: [dts()],
};
