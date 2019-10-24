import {eq, ok} from '../../../dist/bundle/module.js';

ok(true, 'true is truthy');
eq([], [2], 'unhappy arrays');
eq({foo: 'bar'}, {foo: 'bar'}, 'foo bar');
