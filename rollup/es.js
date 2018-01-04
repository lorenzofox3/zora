import node from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	input: './lib/plan.js',
	output:{
		file:'./dist/zora.es.js',
		format:'es'
	},
	plugins: [node(), commonjs()]
};