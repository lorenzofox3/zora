import tape from 'tape';
import plan from '../lib/plan';

function assert(expArray, t) {
	return function * () {
		let index = 0;
		try {
			while (true) {
				const test = yield;
				const {items} = test;
				t.ok(test.executionTime !== undefined, 'execution time');
				for (let a of items) {
					const exp = expArray[index];
					t.equal(a.actual, exp.actual, 'actual');
					t.equal(a.expected, exp.expected, 'expected');
					t.equal(a.message, exp.message, 'message');
					t.equal(a.operator, exp.operator, 'operator');
					t.equal(a.pass, exp.pass, 'pass');
					index++;
				}
			}
		} catch (e) {
			console.log(e);
		}
		finally {
			t.equal(index, expArray.length);
			t.end();
		}
	}
}

function testFunc() {

	tape('add a test', t => {
		const description = 'desc';
		const p = plan();
		const spec = () => {
		};

		p.test(description, spec);

		t.equal(p.length, 1);
		t.equal(p.items[0].description, 'desc');

		t.end();
	});

	tape('compose plans', t => {
		const spec = () => {
		};
		const description = 'desc';
		const p = plan();

		p.test(description, spec);
		const sp = plan();

		sp.test(description, spec);
		sp.test(p);

		t.equal(sp.length, 2);

		t.end();
	});

	tape('only: only run the tests with only statement', t => {
		const p = plan();

		p.test('should not run', (t) => {
			t.fail();
		});

		p.only('should run this one', (t) => {
			t.ok(true);
		});

		p.only('should run this one too', (t) => {
			t.ok(true);
		});

		p.run(assert([
			{
				actual: true,
				description: 'should run this one',
				expected: true,
				message: 'should be truthy',
				operator: 'ok',
				pass: true,
				id: 2
			},
			{
				actual: true,
				description: 'should run this one too',
				expected: true,
				message: 'should be truthy',
				operator: 'ok',
				pass: true,
				id: 3
			}
		], t));
	});

	tape('only: only run the tests with only statement with composition', t => {
		const p1 = plan();
		const p2 = plan();
		const masterPlan = plan();

		p1.test('should not run this test', (t) => {
			t.fail();
		});

		p2.test('should not run', (t) => {
			t.fail();
		});

		p2.only('should run this one', (t) => {
			t.ok(true);
		});

		p2.only('should run this one too', (t) => {
			t.ok(true);
		});

		masterPlan
			.test(p1)
			.test(p2);

		masterPlan.run(assert([
			{
				actual: true,
				description: 'should run this one',
				expected: true,
				message: 'should be truthy',
				operator: 'ok',
				pass: true,
				id: 3
			},
			{
				actual: true,
				description: 'should run this one too',
				expected: true,
				message: 'should be truthy',
				operator: 'ok',
				pass: true,
				id: 4
			}
		], t));
	});

	tape('plan running tests', t => {
		const p = plan();

		p.test('test 1', (assert) => {
			assert.ok(true);
		});

		p.test('test 2', (assert) => {
			assert.ok(true);
		});

		p.run(assert([
			{
				actual: true,
				expected: true,
				message: 'should be truthy',
				operator: 'ok',
				pass: true
			}, {
				actual: true,
				expected: true,
				message: 'should be truthy',
				operator: 'ok',
				pass: true,
			}
		], t));
	});

	tape('plan running tests in sequence', t => {
		const p = plan({sequence: true});
		let globalCounter = 0;
		const test = (assert, value, delay) => {
			return new Promise(resolve => {
				setTimeout(() => {
					assert.equal(globalCounter, value);
					globalCounter++;
					resolve();
				}, delay);
			});
		};

		p.test('test 1', async assert => {
			await test(assert, 0, 300);
		});

		p.test('test 2', async assert => {
			await test(assert, 1, 200);
		});

		p.test('test 3', async assert => {
			await test(assert, 2, 100);
		});

		p.run(assert([{
			actual: 0,
			expected: 0,
			message: 'should be equal',
			operator: 'equal',
			pass: true
		}, {
			actual: 1,
			expected: 1,
			message: 'should be equal',
			operator: 'equal',
			pass: true
		}, {
			actual: 2,
			expected: 2,
			message: 'should be equal',
			operator: 'equal',
			pass: true
		}
		], t));
	});
}

export default testFunc;