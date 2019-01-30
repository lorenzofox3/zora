const {ok, skip, test} = require('../../../dist/bundle/index.js');

ok(true, 'hey hey');
ok(true, 'hey hey bis');

test('hello world', t => {
    t.ok(true);
    t.skip('blah', t => {
        t.ok(false);
    });
    t.skip('for some reason');
});

skip('failing text', t => {
    t.ok(false);
});
