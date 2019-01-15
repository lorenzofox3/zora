const {test} = require('./dist/bundle/index.js');
// import {test} from './dist/bundle/module.js';
// test.indent();

test('main one', t => {
    t.ok(true);

    t.test('inside', t => {

        t.test('deep inside', t => {
            // throw new Error('hey hey');
            t.eq({foo: 'bar'}, {foo: 'br', bim: 2});
        });
    });

    t.test('nested', t => {
        t.ok(true, 'woot hey');
    });
});

test('another one', t => {
    t.ok(true);
    t.eq(true, 'true');
});
