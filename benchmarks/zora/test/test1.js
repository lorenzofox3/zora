
const plan = require('../../../dist/index.js')();
for (let i = 0; i < 8; i++) {
  plan.test('test ' + i, async function (assert) {
    await new Promise(resolve => {
      setTimeout(()=>resolve(),60);
    });
    assert.ok(Math.random() * 100 > 10);
  });
}
module.exports = plan;
