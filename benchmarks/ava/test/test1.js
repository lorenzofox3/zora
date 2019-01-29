
const test = require('ava');
for (let i = 0; i < 4; i++) {
  test('test ' + i, async function (assert) {
    await new Promise(resolve => {
      setTimeout(()=>resolve(),20);
    });
    assert.truthy(Math.random() * 100 > 5);
  });
}
