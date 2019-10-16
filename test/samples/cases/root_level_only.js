import {ok, eq} from '../../../src/index.js';

ok(true, 'true is truthy');
eq({foo: 'bar'}, {foo: 'bar'}, 'foo bar');
