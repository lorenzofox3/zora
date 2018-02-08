
const test = require('../../../dist/index.js');
for (let i = 0; i < 8; i++) {
  test('test ' + i, async function (assert) {
    await new Promise(resolve => {
      setTimeout(()=>resolve(),60);
    });
    assert.ok(Math.random() * 100 > 10);
  });
}
