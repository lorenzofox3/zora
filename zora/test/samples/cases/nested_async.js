import {test} from '../../../dist/bundle/module.js';

const wait = time => new Promise(resolve => {
    setTimeout(() => resolve(), time);
});

test('tester 1', async t => {

    let counter = 0;

    t.test('update counter with delay', async t => {
        t.ok(true, 'nested 1');
        await wait(100);
        counter++;
        t.ok(true, 'nested 2');
    });

    t.test('check counter', t => {
        t.equal(counter, 0, 'should see the old value of the counter');
    });

    t.ok(true, 'assert2');
});

test('tester 2', async t => {
    let counter = 0;
    t.ok(true, 'assert3');

    await t.test('update counter with delay but blocking', async t => {
        t.ok(true, 'nested 1');
        await wait(100);
        counter++;
        t.ok(true, 'nested 2');
    });

    t.test('check counter bis', t => {
        t.equal(counter, 1, 'should see the new value of the counter');
    });

    t.ok(true, 'whatever');
});
