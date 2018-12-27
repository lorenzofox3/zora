export default {
    input: './dist/src/index.js',
    output: [{
        file: './dist/bundle/index.js',
        format: 'cjs'
    }, {
        file: './dist/bundle/index.mjs',
        format: 'es'
    }, {
        file: './dist/bundle/module.js',
        format: 'es'
    }]
};
