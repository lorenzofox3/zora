'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var deepEqual = _interopDefault(require('deep-equal'));

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

	this.collect(assertResult);
	return assertResult;
};

const Assertion = {
	test(description, spec) {
		const t = tester(description, spec)
			.run()
			.then(r => Object.assign(r, {pass: r.testPoints.every(tp => tp.pass === true)}));
		this.collect(t);
		return t;
	},
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

var assert = collect => Object.create(Assertion, {collect: {value: collect}});

const noop = () => {};
const skip = description => test('SKIPPED - ' + description, noop);

const Test = {
	async run() {
		const tests = [];
		const collectResult = tp => tests.push(tp);
		const start = Date.now();
		await this.spec(assert(collectResult)); // Collection
		const testPoints = await Promise.all(tests); // Execution (some collection functions are async such sub test)
		const executionTime = Date.now() - start;
		return Object.assign(this, {
			executionTime,
			testPoints
		});
	},
	skip() {
		return skip(this.description);
	}
};

var tester = (description, spec, {only = false} = {}) => Object.create(Test, {
	only: {value: only},
	spec: {value: spec},
	description: {value: description}
});

const print = (message, offset = 0) => {
	console.log(message.padStart(message.length + offset * 2));
};

function printResult(r, offset = 0) {
	const comment = `# ${r.description} - ${r.executionTime}ms`;
	print(comment, offset);
	for (const item of r.testPoints) {
		if (item.testPoints) {
			// Sub test
			printResult(item, offset + 1);
		}
		const toPrint = `${item.pass === true ? 'ok' : 'not ok'} - ${item.description}`;
		print(toPrint, offset);
	}

	if (offset > 0) {
		const plan = `1..${r.testPoints.length}`;
		print(plan, offset);
		print(`# time=${r.executionTime}ms`, offset);
	}
}

const onNextTick = v => new Promise(resolve => {
	setTimeout(() => {
		resolve(v);
	}, 0);
});


const factory = (reporter = printResult) => {
	const tests = [];
	setTimeout(async () => {
		for (const t of tests) {
			const r = await onNextTick(t); // On next tick to give some time to the reporter if it needs (like browser reporter)
			if (r.pass) {
				
			} else {
				
			}
			reporter(r);
		}
		//todo print summary!
	}, 0);

	//todo add a only/skip on the factory
	const test = (description, spec) => {
		const t = tester(description, spec);
		tests.push(t.run());
	};

	return test;
};

var index = factory()

module.exports = index;
