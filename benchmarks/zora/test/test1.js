
module.exports =(({test}) => {
for (let i = 0; i < 10; i++) {
  test('test ' + i, async function (assert) {
    await new Promise(resolve => {
      setTimeout(()=>resolve(),100);
    });
    assert.ok(Math.random() * 100 > 5);
  });
}});
