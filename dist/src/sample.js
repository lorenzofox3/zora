import { test } from './index';
const wait = (time = 500) => new Promise(resolve => {
    setTimeout(() => resolve(), time);
});
test('another one', async (t) => {
    // console.time('another one');
    await wait(1000);
    t.ok('foo', 'foo is truthy');
    // console.timeEnd('another one');
});
test('a simple tester', async (t) => {
    // console.time('a simple tester');
    t.is(3, 2, 'should fail');
    await wait(700);
    await t.test('inside', async (t) => {
        // console.time('inside');
        await wait(800);
        t.is('insider', 'insidrer', 'from insider');
        // console.timeEnd('inside');
    });
    t.test('inside not waiting', async (t) => {
        // console.time('inside not waiting');
        t.test('deep inside not waiting', async (t) => {
            // console.time('deep inside not waiting');
            await wait(400);
            t.is('bar', 'bar', 'bar');
            // console.timeEnd('deep inside not waiting');
        });
        await t.test('deep inside', async (t) => {
            // console.time('deep inside');
            await wait(200);
            t.is('foo', 'foo', 'deep inside assert');
            // console.timeEnd('deep inside');
        });
        // console.timeEnd('inside not waiting');
    });
    t.is(4, 4, 'four should be four bis');
    // console.timeEnd('a simple tester');
});
