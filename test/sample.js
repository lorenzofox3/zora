const plan = require('../dist/zora')();
const tape = require('tape');

plan
	.test('assertions', (assert) => {
		assert.equal('foo', 'foo');
		assert.equal('foo', 'bar');
		assert.deepEqual({foo: 'bar'}, {foo: 'bar'});
		assert.deepEqual({foo: 'bar'}, 'foo');
		assert.ok(true);
		assert.ok(false);
		assert.fail('wanted to fail');
	})
	.test('async test', async (assert) => {
		const p = new Promise(function (resolve) {
			setTimeout(function () {
				resolve('foo')
			}, 3000)
		});

		const val = await p;
		assert.equal(val, 'foo', 'should have passed an async test');
	});

plan.run();


// tape('assertions', (assert) => {
// 	assert.equal('foo', 'foo');
// 	assert.equal('foo', 'bar');
// 	assert.deepEqual({foo: 'bar'}, {foo: 'bar'});
// 	assert.deepEqual({foo: 'bar'}, 'foo');
// 	assert.ok(true);
// 	assert.ok(false);
// 	assert.fail('wanted to fail');
// })



