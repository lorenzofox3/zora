const plan = require('../dist/zora')();

plan
  .test('assertions', function * (assert) {
    assert.equal('foo', 'foo');
    assert.equal('foo', 'bar');
    assert.deepEqual({foo: 'bar'}, {foo: 'bar'});
    assert.deepEqual({foo: 'bar'}, 'foo');
    assert.ok(true);
    assert.ok(false);
    assert.fail('wanted to fail');
  })
  .test('async test', function * (assert) {
    const p = new Promise(function (resolve) {
      setTimeout(function () {
        resolve('foo')
      }, 3000)
    });

    const val = yield p;
    assert.equal(val, 'foo', 'should have passed an async test');
  });

module.exports=plan;



