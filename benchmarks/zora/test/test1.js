
const {test} = require('../../../dist/bundle/index.js');
for (let i = 0; i < 4; i++) {
  test('test ' + i, async function (assert) {
    await new Promise(resolve => {
      setTimeout(()=>resolve(),20);
    });
    assert.ok(Math.random() * 100 > 5);
  });
}
