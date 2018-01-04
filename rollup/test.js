import node from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	input: './test/index.js',
	output:{
		file:'./test/dist/index.js',
		format:'cjs',
		sourcemap:true
	},
	plugins: [node(), commonjs()],
};