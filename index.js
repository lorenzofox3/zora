const test = require('tape');

test('main one', t => {
    t.ok(true);

    t.test('inside', t => {
        t.test('deep inside', t => {
            // throw new Error('hey hey');
            t.equal('insidessr', 'insider');
            t.end();
        });
        t.end();
    });

    t.test('nested', t => {
        t.ok(true, 'woot hey');
        t.end();
    });
    t.end();
});
