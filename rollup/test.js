import node from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	input: './tester/index.js',
	output:{
		format:'cjs'
	},
	plugins: [node(), commonjs()],
};
