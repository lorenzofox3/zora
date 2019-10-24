
const test = require('ava');
for (let i = 0; i < 8; i++) {
  test('test ' + i, async function (assert) {
    await new Promise(resolve => {
      setTimeout(()=>resolve(),50);
    });
    assert.truthy(Math.random() * 100 > 3);
  });
}
