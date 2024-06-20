export default {
  input: './src/index.js',
  output: [
    {
      format: 'cjs',
      file: './dist/index.cjs',
    },
    {
      format: 'es',
      file: './dist/index.js'
    }
  ],
};
