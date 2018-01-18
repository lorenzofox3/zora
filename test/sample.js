const plan = require('../dist/zora')();

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
			}, 200)
		});

		const val = await p;
		assert.equal(val, 'foo', 'should have passed an async test');
	})
	.test('async test', async (assert) => {
		const p = new Promise(function (resolve) {
			setTimeout(function () {
				resolve('foo')
			}, 100)
		});

		const val = await p;
		assert.equal(val, 'foo', 'should have passed an async test');
	});

plan.run();