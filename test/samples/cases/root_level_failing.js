const {ok, eq, test} = require('../../../dist/bundle/index.js');

ok(true, 'true is truthy');
eq([],[2],'unhappy arrays');
eq({foo: 'bar'}, {foo: 'bar'}, 'foo bar');
