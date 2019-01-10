import {createHarness, test, is, ok} from './index';
import {mochaTapLike} from './reporter';

// const harness = createHarness();
// const {test: htest, is: his, ok: hok} = harness;
//
// const test = htest.bind(harness);
// const is = his.bind(harness);
// const ok = hok.bind(harness);

const wait = (time = 500) => new Promise(resolve => {
    setTimeout(() => resolve(), time);
});

test('a simple tester', async t => {
    t.is(3, 2, 'should fail');

    await wait(700);

    await t.test('inside', async t => {
        await wait(800);
        t.is('insider', 'insider', 'from insider');
    });

    t.test('inside not waiting', async t => {

        t.test('deep inside not waiting', async t => {
            await wait(400);
            t.ok('another one', 'another one');
            t.is('bar', 'bart', 'bar');
        });

        await t.test('deep inside', async t => {
            await wait(200);
            t.is('foo', 'foo', 'deep inside assert');
        });
    });

    t.is(4, 4, 'four should be four bis');
});

test('another one', async t => {
    await wait(1000);
    t.ok('foo', 'foo is truthy');
    t.ok('foobis', 'foobis is truthy');
});

// is('foo', 'foo', 'a foo test');
// ok(false);
// is('what', 'what', 'a what test');


// harness.report(mochaTapLike);


