import node from 'rollup-plugin-node-resolve';
import cjs from 'rollup-plugin-commonjs';

export default {
    input: './test/unit/index.js',
    output: [{
        format: 'cjs'
    }],
    plugins: [node(), cjs({
        ignore:['tape']
    })]
};
