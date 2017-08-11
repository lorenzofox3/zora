const rollup = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
rollup.rollup({
  entry: './lib/plan.js',
  plugins: [
    nodeResolve(),
    commonjs()
  ]
}).then(function (bundle) {
  return Promise.all([bundle.write({
    format: 'es',
    dest: './dist/zora.es.js'
  })], bundle.write({
    format: 'umd',
    dest: './dist/zora.js',
    moduleName: 'Zora'
  }));
});
