import {test} from '../../../dist/bundle/module.js';

test('will not go to the end', t => {
    t.ok(true, 'okay');

    throw new Error('Oh no!');

    t.ok(true, 'will never be reached');
});

test('another one', t => {
    t.ok(true, 'will never be reported');
});
