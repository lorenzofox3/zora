import deepEqual from 'deep-equal';

const getAssertionLocation = () => {
	const err = new Error();
	const stack = (err.stack || '').split('\n');
	return (stack[3] || '').trim().replace(/^at/i, '');
};

const assertMethodHook = fn => function (...args) {
	const assertResult = fn(...args);

	if (assertResult.pass === false) {
		assertResult.at = getAssertionLocation();
	}

	this.collect({type: 'assert', data: assertResult, offset: this.offset});
	return assertResult;
};

const Assertion = {
	ok: assertMethodHook((val, description = 'should be truthy') => ({
		pass: Boolean(val),
		actual: val,
		expected: true,
		description,
		operator: 'ok'
	})),
	deepEqual: assertMethodHook((actual, expected, description = 'should be equivalent') => ({
		pass: deepEqual(actual, expected),
		actual,
		expected,
		description,
		operator: 'deepEqual'
	})),
	equal: assertMethodHook((actual, expected, description = 'should be equal') => ({
		pass: actual === expected,
		actual,
		expected,
		description,
		operator: 'equal'
	})),
	notOk: assertMethodHook((val, description = 'should not be truthy') => ({
		pass: !val,
		expected: false,
		actual: val,
		description,
		operator: 'notOk'
	})),
	notDeepEqual: assertMethodHook((actual, expected, description = 'should not be equivalent') => ({
		pass: !deepEqual(actual, expected),
		actual,
		expected,
		description,
		operator: 'notDeepEqual'
	})),
	notEqual: assertMethodHook((actual, expected, description = 'should not be equal') => ({
		pass: actual !== expected,
		actual,
		expected,
		description,
		operator: 'notEqual'
	})),
	throws: assertMethodHook((func, expected, description) => {
		let caught;
		let pass;
		let actual;
		if (typeof expected === 'string') {
			[expected, description] = [description, expected];
		}
		try {
			func();
		} catch (err) {
			caught = {error: err};
		}
		pass = caught !== undefined;
		actual = caught && caught.error;
		if (expected instanceof RegExp) {
			pass = expected.test(actual) || expected.test(actual && actual.message);
			expected = String(expected);
		} else if (typeof expected === 'function' && caught) {
			pass = actual instanceof expected;
			actual = actual.constructor;
		}
		return {
			pass,
			expected,
			actual,
			operator: 'throws',
			description: description || 'should throw'
		};
	}),
	doesNotThrow: assertMethodHook((func, expected, description) => {
		let caught;
		if (typeof expected === 'string') {
			[expected, description] = [description, expected];
		}
		try {
			func();
		} catch (err) {
			caught = {error: err};
		}
		return {
			pass: caught === undefined,
			expected: 'no thrown error',
			actual: caught && caught.error,
			operator: 'doesNotThrow',
			message: description || 'should not throw'
		};
	}),
	fail: assertMethodHook((description = 'fail called') => ({
		pass: false,
		actual: 'fail called',
		expected: 'fail not called',
		description,
		operator: 'fail'
	}))
};

var assert = (collect, offset = 0) => {

	const test = tester(collect, offset + 1);

	return Object.assign(
		Object.create(Assertion, {collect: {value: collect}, offset: {value: offset}}), {
			test(description, spec) {
				// Note: we return the coroutine so the caller can control whether he wants to wait for the sub test to complete or not
				return Promise.resolve(test(description, spec).coRoutine);
			}
		});
}

const Test = {
	[Symbol.asyncIterator]() {
		return this;
	},
	async next() {
		if (this.buffer.length === 0) {
			if (this.result !== null) {
				return {done: true, value: this.result};
			}
			// Flush
			await this.coRoutine;
			return this.next();
		}

		const next = this.buffer[0];

		// Delegate with sub tests
		if (next[Symbol.asyncIterator] !== void 0) {
			const delegated = await next.next();

			// Delegate is exhausted
			if (delegated.done === true) {
				const {executionTime, count, offset} = delegated.value;
				this.buffer.shift();

				this.buffer.unshift({type: 'time', data: executionTime, offset});
				this.buffer.unshift({type: 'plan', data: {start: 1, end: count}, offset});

				// this.buffer.unshift({type:'assert',data:{}, offset})


				return this.next();
			}

			return delegated;
		}

		return {value: this.buffer.shift(), done: false};
	}
};

var tester = (collect, offset = 0) => (description, spec) => {
	const buffer = [{type: 'title', data: description, offset}];
	let result = null;
	let count = 0;

	// Start assertion collection
	const assertFn = assert(i => {
		count++;
		if (i.data) {
			i.data.id = count;
		} else {
			i.id = count;
		}
		buffer.push(i);
	}, offset);
	const start = Date.now();
	const coRoutine = Promise.resolve(spec(assertFn))
		.then(() => {
			return {
				offset,
				spec,
				description,
				count,
				executionTime: Date.now() - start
			};
		})
		.then(r => result = r);

	const test = Object.create(Test, {
		buffer: {value: buffer},
		coRoutine: {value: coRoutine},
		result: {get() {return result;}},
		count: {get() {return count;}}
	});

	// Collection by the calling test
	collect(test);

	return test;
};

const print = (message, offset = 0) => {
	console.log(message.padStart(message.length + offset * 4)); // 4 white space used as indent (see tap-parser)
};

const tap = {
	version(version = 13, offset = 0) {
		print(`TAP version ${version}`, offset);
	},
	title(value, offset = 0) {
		const message = offset > 0 ? `Subtest: ${value}` : value;
		this.comment(message, offset);
	},
	assert(value, offset = 0) {
		const {pass, description, id} = value;
		const label = pass === true ? 'ok' : 'not ok';
		print(`${label} ${id} - ${description}`, offset);
	},
	plan(value, offset = 0) {
		print(`1..${value.end}`, offset);
	},
	time(value, offset = 0) {
		this.comment(`time=${value}ms`, offset);
	},
	comment(value, offset = 0) {
		print(`# ${value}`, offset);
	}
};

var tap$1 = (toPrint = {}) => {
	const {data, type, offset = 0,} = toPrint;
	if (typeof tap[type] === 'function') {
		tap[type](data, offset);
	}
	// Else ignore
};

const tests = [];
const test = tester(t => tests.push(t));
setTimeout(async () => {
	tap$1({type:'version'});
	for (const t of tests) {
		while (true) {
			const {done, value} = await t.next();
			if (done === true) {
				break;
			}
			tap$1(value);
		}
	}
}, 0);

export default test;
