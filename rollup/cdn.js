import node from 'rollup-plugin-node-resolve';
import cjs from 'rollup-plugin-commonjs';

export default {
    input: './dist/src/sample.js',
    output: [{
        file: './dist/bundle/zora.js',
        format: 'iife',
        name: 'zora',
        sourcemap: true
    }, {
        file: './dist/bundle/zora.es.js',
        format: 'es',
        sourcemap: true
    }],
    plugins: [node(),cjs()]
};
