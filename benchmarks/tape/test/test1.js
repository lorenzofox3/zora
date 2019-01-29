const test = require('tape');
for (let i = 0; i < 4; i++) {
    test('test ' + i, function (assert) {
        setTimeout(() => {
            assert.ok(Math.random() * 100 > 5);
            assert.end();
        }, 20);
    });
}

test.skip('I want to be skipped', t => {
    t.ok(false);
});
