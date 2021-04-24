import {test} from '../../../dist/bundle/module.js';

test('tester 1', t => {
    t.ok(true, 'assert1');
    t.test('inside', t => {
        t.ok(true, 'correct');
        t.equal(4, '4', 'should fail with coercion');
    });
});
