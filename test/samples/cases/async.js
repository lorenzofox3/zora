import {test} from '../../../dist/bundle/module.js';

const wait = time => new Promise(resolve => {
    setTimeout(() => resolve(), time);
});

test('tester 1', async t => {
    t.ok(true, 'assert1');
    await wait(500);
    t.ok(true, 'assert2');
});

test('tester 2', async t => {
    t.ok(true, 'assert3');
    await wait(300);
    t.ok(true, 'assert4');
});
