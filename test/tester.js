import test from 'tape';
import tester from '../lib/test';
import {combine} from "../lib/combinators";

const createTester = () => {
	const buffer = [];
	const testFn = tester(i => buffer.push(i));
	testFn.buffer = buffer;
	return testFn;
};

const wait = (time = 0) => new Promise(resolve => {
	setTimeout(() => resolve(), time);
});

const check = async (t, buffer, expected) => {
	const stream = combine(...buffer);
	const messages = [];

	while (true) {
		const {done, value} = await stream.next();
		if (done) {
			break;
		}
		messages.push(value);
	}

	//we need to drop moving parts
	const toCheck = messages
		.filter(m => m.type !== 'time')
		.map(m => {
			if (m.data && (m.data.executionTime !== undefined)) {
				delete m.data.executionTime;
			}
			return m;
		});

	t.deepEqual(toCheck, expected, 'should have the list of message');
};


test('simple case', async t => {
	const fn = createTester();

	fn('some test', t => {
		t.equal(2, 2, 'equality');
		t.ok(true, 'a second assertion');
	});

	fn('some second test', t => {
		t.equal(2, 2, 'equality in second test');
		t.ok(true, 'and another one');
	});

	const {buffer} = fn;

	await check(t, buffer, [{type: 'title', data: 'some test', offset: 0}, {
			type: 'assert',
			data: {pass: true, actual: 2, expected: 2, description: 'equality', operator: 'equal', id: 1},
			offset: 0
		}, {
			type: 'assert',
			data: {pass: true, actual: true, expected: true, description: 'a second assertion', operator: 'ok', id: 2},
			offset: 0
		}, {type: 'plan', data: {start: 1, end: 2}, offset: 0}, {
			type: 'title',
			data: 'some second test',
			offset: 0
		}, {
			type: 'assert',
			data: {pass: true, actual: 2, expected: 2, description: 'equality in second test', operator: 'equal', id: 1},
			offset: 0
		}, {
			type: 'assert',
			data: {pass: true, actual: true, expected: true, description: 'and another one', operator: 'ok', id: 2},
			offset: 0
		}, {type: 'plan', data: {start: 1, end: 2}, offset: 0}]
	);

	t.end();
});

test('async case', async t => {
	const fn = createTester();

	fn('some longer test first', async t => {
		t.equal(2, 2, 'equality');
		await wait(100);
		t.ok(true, 'a second assertion');
	});

	fn('some faster test second', async t => {
		t.equal(2, 2, 'equality in second test');
		await wait(50);
		t.ok(true, 'and another one');
	});

	const {buffer} = fn;

	await check(t, buffer, [{type: 'title', data: 'some longer test first', offset: 0}, {
			type: 'assert',
			data: {pass: true, actual: 2, expected: 2, description: 'equality', operator: 'equal', id: 1},
			offset: 0
		}, {
			type: 'assert',
			data: {pass: true, actual: true, expected: true, description: 'a second assertion', operator: 'ok', id: 2},
			offset: 0
		}, {type: 'plan', data: {start: 1, end: 2}, offset: 0}, {
			type: 'title',
			data: 'some faster test second',
			offset: 0
		}, {
			type: 'assert',
			data: {pass: true, actual: 2, expected: 2, description: 'equality in second test', operator: 'equal', id: 1},
			offset: 0
		}, {
			type: 'assert',
			data: {pass: true, actual: true, expected: true, description: 'and another one', operator: 'ok', id: 2},
			offset: 0
		}, {type: 'plan', data: {start: 1, end: 2}, offset: 0}]
	);

	t.end();
});

test('nested', async t => {
	const fn = createTester();

	fn('some first root', t => {
		t.equal(2, 2, 'before');

		t.test('inside', t => {
			t.ok(true, 'before inside');

			t.test('deep', t => {
				t.ok(true, 'deeply');
			});

			t.ok('after deep');
		});

		t.ok(true, 'after');
	});

	fn('some other test', async t => {
		t.ok(true, 'just to check');
	});

	const {buffer} = fn;
	await check(t, buffer, [{type: 'title', data: 'some first root', offset: 0}, {
			type: 'assert',
			data: {pass: true, actual: 2, expected: 2, description: 'before', operator: 'equal', id: 1},
			offset: 0
		}, {type: 'title', data: 'inside', offset: 1}, {
			type: 'assert',
			data: {pass: true, actual: true, expected: true, description: 'before inside', operator: 'ok', id: 1},
			offset: 1
		}, {type: 'title', data: 'deep', offset: 2}, {
			type: 'assert',
			data: {pass: true, actual: true, expected: true, description: 'deeply', operator: 'ok', id: 1},
			offset: 2
		}, {type: 'plan', data: {start: 1, end: 1}, offset: 2}, {
			type: 'testAssert',
			data: {pass: true, description: 'deep', id: 2},
			offset: 1
		}, {
			type: 'assert',
			data: {pass: true, actual: 'after deep', expected: true, description: 'should be truthy', operator: 'ok', id: 3},
			offset: 1
		}, {type: 'plan', data: {start: 1, end: 3}, offset: 1}, {
			type: 'testAssert',
			data: {pass: true, description: 'inside', id: 2},
			offset: 0
		}, {
			type: 'assert',
			data: {pass: true, actual: true, expected: true, description: 'after', operator: 'ok', id: 3},
			offset: 0
		}, {type: 'plan', data: {start: 1, end: 3}, offset: 0}, {
			type: 'title',
			data: 'some other test',
			offset: 0
		}, {
			type: 'assert',
			data: {pass: true, actual: true, expected: true, description: 'just to check', operator: 'ok', id: 1},
			offset: 0
		}, {type: 'plan', data: {start: 1, end: 1}, offset: 0}]
	);
	t.end();
});

test('nested async', async t => {
	const fn = createTester();

	fn('keep parallel', async t => {
		let counter = 0;

		t.test('a first test', async t => {
			t.ok(true, 'inside first');
			await wait(50);
			counter++;
		});

		t.test('check counter', t => {
			t.equal(counter, 0, 'should find the not updated value');
		})

	});

	fn('control flow', async t => {
		let counter = 0;

		await t.test('a first test', async t => {
			t.ok(true, 'inside first');
			await wait(50);
			counter++;
		});

		t.test('check counter', t => {
			t.equal(counter, 1, 'should have the updated value');
		})
	});

	const {buffer} = fn;
	await check(t, buffer, [{type: 'title', data: 'keep parallel', offset: 0}, {
		type: 'title',
		data: 'a first test',
		offset: 1
	}, {
		type: 'assert',
		data: {pass: true, actual: true, expected: true, description: 'inside first', operator: 'ok', id: 1},
		offset: 1
	}, {type: 'plan', data: {start: 1, end: 1}, offset: 1}, {
		type: 'testAssert',
		data: {pass: true, description: 'a first test', id: 1},
		offset: 0
	}, {type: 'title', data: 'check counter', offset: 1}, {
		type: 'assert',
		data: {
			pass: true,
			actual: 0,
			expected: 0,
			description: 'should find the not updated value',
			operator: 'equal',
			id: 1
		},
		offset: 1
	}, {type: 'plan', data: {start: 1, end: 1}, offset: 1}, {
		type: 'testAssert',
		data: {pass: true, description: 'check counter', id: 2},
		offset: 0
	}, {type: 'plan', data: {start: 1, end: 2}, offset: 0}, {
		type: 'title',
		data: 'control flow',
		offset: 0
	}, {type: 'title', data: 'a first test', offset: 1}, {
		type: 'assert',
		data: {pass: true, actual: true, expected: true, description: 'inside first', operator: 'ok', id: 1},
		offset: 1
	}, {type: 'plan', data: {start: 1, end: 1}, offset: 1}, {
		type: 'testAssert',
		data: {pass: true, description: 'a first test', id: 1},
		offset: 0
	}, {type: 'title', data: 'check counter', offset: 1}, {
		type: 'assert',
		data: {pass: true, actual: 1, expected: 1, description: 'should have the updated value', operator: 'equal', id: 1},
		offset: 1
	}, {type: 'plan', data: {start: 1, end: 1}, offset: 1}, {
		type: 'testAssert',
		data: {pass: true, description: 'check counter', id: 2},
		offset: 0
	}, {type: 'plan', data: {start: 1, end: 2}, offset: 0}]);

	t.end();
});

test('bailout', async t => {
	let error = null;
	const fn = createTester();

	fn('will throw', t => {
		t.ok('should be seen');
		error = new Error('Oh no!');
		throw error;
	});

	const {buffer} = fn;

	await check(t, buffer, [{type: 'title', data: 'will throw', offset: 0}, {
			type: 'assert',
			data: {
				pass: true,
				actual: 'should be seen',
				expected: true,
				description: 'should be truthy',
				operator: 'ok',
				id: 1
			},
			offset: 0
		}, {type: 'assert', data: {pass: false, description: 'will throw'}}, {
			type: 'comment',
			data: 'Unhandled exception'
		}, {type: 'bailout', data: error, offset: 0}]
	);

	t.ok(error, 'error should be defined');
	t.end();
});

test('nested bailout', async t => {
	let error = null;
	const fn = createTester();

	fn('will throw', t => {
		t.ok(true, 'should be seen');

		t.test('inside', t => {
			t.ok(true, 'assert inside');
			error = new Error('Oh no!');
			throw error;
		});
	});

	const {buffer} = fn;

	await check(t, buffer, [{type: 'title', data: 'will throw', offset: 0}, {
		type: 'assert',
		data: {pass: true, actual: true, expected: true, description: 'should be seen', operator: 'ok', id: 1},
		offset: 0
	}, {type: 'title', data: 'inside', offset: 1}, {
		type: 'assert',
		data: {pass: true, actual: true, expected: true, description: 'assert inside', operator: 'ok', id: 1},
		offset: 1
	}, {type: 'assert', data: {pass: false, description: 'inside'}}, {
		type: 'comment',
		data: 'Unhandled exception'
	}, {type: 'bailout', data: error, offset: 1}, {
		type: 'testAssert',
		data: {pass: true, description: 'inside', id: 2, executionTime: undefined},
		offset: 0
	}, {type: 'plan', data: {start: 1, end: 2}, offset: 0}]);

	t.ok(error, 'error should be defined');
	t.end();
});