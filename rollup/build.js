export default {
	input: './lib/test.js',
	output:[{
		file:'./dist/index.mjs',
		format:'es'
	},{
		file:'./dist/index.js',
		format:'cjs'
	}]
};