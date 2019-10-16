export default {
    input: './src/index.js',
    output: [{
        file: './dist/bundle/index.js',
        format: 'cjs'
    }, {
        file: './dist/bundle/index.mjs',
        format: 'es'
    }],
    plugins: []
};
