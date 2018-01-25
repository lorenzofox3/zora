import node from 'rollup-plugin-node-resolve';
import cjs from 'rollup-plugin-commonjs';

export default {
	input: './lib/plan.js',
	output: [{
		file: './dist/zora.js',
		format: 'iife',
		name: 'zora',
		sourcemap: true
	},{
		file: './dist/zora.es.js',
		format: 'es',
		sourcemap: true
	}],
	plugins: [node(), cjs()]
};