const plan = require('../dist/zora')();

plan
  .test('foo', function * (assert) {
    assert.equal('foo', 'foo');
    // throw new Error('foo');
    assert.deepEqual({foo:'bar'}, 'foo');
  })
  .test('blah', function * (assert) {

    const p = new Promise(function (resolve) {
      setTimeout(function () {
        resolve('foo')
      }, 3000)
    });

    const val = yield p;
    assert.equal(val, 'foo');
  })
  .run();




