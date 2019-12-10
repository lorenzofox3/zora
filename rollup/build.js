import node from 'rollup-plugin-node-resolve';
import cjs from 'rollup-plugin-commonjs';

export default {
    input: './src/index.js',
    output: [{
        file: './dist/bundle/index.js',
        format: 'cjs'
    }, {
        file: './dist/bundle/index.mjs',
        format: 'es'
    }, {
        file: './dist/bundle/module.js',
        format: 'es'
    }],
    plugins: [node(), cjs()]
};
