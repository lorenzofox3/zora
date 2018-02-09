import node from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	input: './test/index.js',
	output:{
		format:'cjs'
	},
	plugins: [node(), commonjs()],
};