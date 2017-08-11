import node from 'rollup-plugin-node-resolve';
import common from 'rollup-plugin-commonjs';

export default {
  entry:'./lib/plan.js',
  dest:'./dist/zora.js',
  plugins:[node(),common()],
  format:'umd',
  moduleName:'zora',
  sourceMap:true
}