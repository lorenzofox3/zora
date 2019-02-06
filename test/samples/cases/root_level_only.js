const {ok, eq, test} = require('../../../dist/bundle/index.js');

ok(true, 'true is truthy');
eq({foo: 'bar'}, {foo: 'bar'}, 'foo bar');
