import node from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	input: './lib/plan.js',
	output:[{
		file:'./dist/zora.mjs',
		format:'es'
	},{
		file:'./dist/zora.js',
		format:'umd',
		name:'zora'
	}],
	plugins: [node(), commonjs()]
};