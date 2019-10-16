import {ok, test, eq} from '../../../src/index.js';

ok(true, 'true is truthy');

test('a sub test', t => {
    t.eq({}, {}, 'empty object');
    t.ok(true, 'another assertion');
});

eq({foo: 'bar'}, {foo: 'bar'}, 'foo bar');
