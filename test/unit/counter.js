import {counter} from '../../src/counter.js';
import {assert} from '../../src/assertion.js';
import {tester} from '../../src/test.js';

const test = require('tape');

test('counter should be initialized with every values at 0', t => {
    const c = counter();
    t.equal(c.successCount, 0, 'success count');
    t.equal(c.failureCount, 0, 'failure count');
    t.equal(c.skipCount, 0, 'skipped count');
    t.equal(c.count, 0, 'total count');
    t.end();
});

test('counter should update success count with successful  assertion result', t => {
    const assertions = [];
    const a = assert(i => assertions.push(i));

    a.ok(true);

    const c = counter();
    c.update(assertions[0]);

    t.equal(c.successCount, 1, 'success count');
    t.equal(c.failureCount, 0, 'failure count');
    t.equal(c.skipCount, 0, 'skipped count');
    t.equal(c.count, 1, 'total count');
    t.end();
});

test('counter should update failing count with failing  assertion result', t => {
    const assertions = [];
    const a = assert(i => assertions.push(i));

    a.ok(false);

    const c = counter();
    c.update(assertions[0]);

    t.equal(c.successCount, 0, 'success count');
    t.equal(c.failureCount, 1, 'failure count');
    t.equal(c.skipCount, 0, 'skipped count');
    t.equal(c.count, 1, 'total count');
    t.end();
});

test('counter should update skip count with skipped assertion result', t => {
    const assertions = [];
    const a = assert(i => assertions.push(i));

    a.skip('some reason');

    const c = counter();
    c.update(assertions[0]);

    t.equal(c.successCount, 0, 'success count');
    t.equal(c.failureCount, 0, 'failure count');
    t.equal(c.skipCount, 1, 'skipped count');
    t.equal(c.count, 1, 'total count');
    t.end();
});

test('counter should update total count with skip, failing and success values', t => {
    const assertions = [];
    const a = assert(i => assertions.push(i));

    a.skip('some reason');
    a.ok(true);
    a.fail();

    const c = counter();

    for (const assertion of assertions) {
        c.update(assertion);
    }

    t.equal(c.successCount, 1, 'success count');
    t.equal(c.failureCount, 1, 'failure count');
    t.equal(c.skipCount, 1, 'skipped count');
    t.equal(c.count, 3, 'total count');
    t.end();
});

test('counter should update with a sub test own count values', async t => {
    const c = counter();
    const test = tester('foo', t => {
        t.ok(true);
        t.skip('skipped');

        t.ok(true);

        t.skip('foo bar', t => {
            t.ok(false);
        });
        t.ok(false);
        t.ok(false);
    });

    let count = 0;
    for await (const op of test) {
        count++;
    }
    t.ok(count, 'should have consumed the test');

    c.update(test);

    t.equal(test.successCount, 2, 'test success count');
    t.equal(test.failureCount, 2, 'test failure count');
    t.equal(test.skipCount, 2, 'test skipped count');
    t.equal(test.count, 6, 'test total count');

    t.equal(c.successCount, test.successCount, 'counter success count should match test success count');
    t.equal(c.failureCount, test.failureCount, 'counter failure count should match test failure count');
    t.equal(c.skipCount, test.skipCount, 'counter skip count should match test skipped count');
    t.equal(c.count, test.count, 'counter total count should match test total count');
    t.end();
});



