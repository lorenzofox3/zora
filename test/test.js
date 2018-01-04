import plan from 'tape';
import {test} from '../lib/test.js';

function testFunc() {

	plan('test: run and resolve with assertions', t => {
		const tp = test('desc', function (assert) {
			assert.ok(true);
		});

		tp.run()
			.then(function ({items, executionTime}) {
				t.deepEqual(items, [{
					actual: true,
					expected: 'truthy',
					message: 'should be truthy',
					operator: 'ok',
					pass: true
				}]);
				t.ok(executionTime !== void 0);
				t.end();
			});
	});

	plan('test: run and resolve with assertions async flow', t => {
		const tp = test('desc', async function (assert) {
			const presult = new Promise(function (resolve) {
				setTimeout(function () {
					resolve(true);
				}, 100)
			});

			const r = await presult;

			assert.ok(r);
		});

		tp.run()
			.then(function ({items, executionTime}) {
				t.deepEqual(items, [{
					actual: true,
					expected: 'truthy',
					message: 'should be truthy',
					operator: 'ok',
					pass: true
				}]);
				t.ok(executionTime);
				t.end();
			});
	});
}

export default testFunc;

