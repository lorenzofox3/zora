'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var tap = _interopDefault(require('zora-tap-reporter'));
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
	ok: assertMethodHook((val, message = 'should be truthy') => ({
		pass: Boolean(val),
		actual: val,
		expected: true,
		message,
		operator: 'ok'
	})),
	deepEqual: assertMethodHook((actual, expected, message = 'should be equivalent') => ({
		pass: deepEqual(actual, expected),
		actual,
		expected,
		message,
		operator: 'deepEqual'
	})),
	equal: assertMethodHook((actual, expected, message = 'should be equal') => ({
		pass: actual === expected,
		actual,
		expected,
		message,
		operator: 'equal'
	})),
	notOk: assertMethodHook((val, message = 'should not be truthy') => ({
		pass: !val,
		expected: false,
		actual: val,
		message,
		operator: 'notOk'
	})),
	notDeepEqual: assertMethodHook((actual, expected, message = 'should not be equivalent') => ({
		pass: !deepEqual(actual, expected),
		actual,
		expected,
		message,
		operator: 'notDeepEqual'
	})),
	notEqual: assertMethodHook((actual, expected, message = 'should not be equal') => ({
		pass: actual !== expected,
		actual,
		expected,
		message,
		operator: 'notEqual'
	})),
	throws: assertMethodHook((func, expected, message) => {
		let caught;
		let pass;
		let actual;
		if (typeof expected === 'string') {
			[expected, message] = [message, expected];
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
			message: message || 'should throw'
		};
	}),
	doesNotThrow: assertMethodHook((func, expected, message) => {
		let caught;
		if (typeof expected === 'string') {
			[expected, message] = [message, expected];
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
			message: message || 'should not throw'
		};
	}),
	fail: assertMethodHook((message = 'fail called') => ({
		pass: false,
		actual: 'fail called',
		expected: 'fail not called',
		message,
		operator: 'fail'
	}))
};

var assert = collect => Object.create(Assertion, {collect: {value: collect}});

const noop = () => {};

const skip = description => test('SKIPPED - ' + description, noop);

const Test = {
	async run() {
		const collect = assertion => this.items.push(assertion);
		const start = Date.now();
		await Promise.resolve(this.spec(assert(collect)));
		const executionTime = Date.now() - start;
		return Object.assign(this, {
			executionTime
		});
	},
	skip() {
		return skip(this.description);
	}
};

function test(description, spec, {only = false} = {}) {
	return Object.create(Test, {
		items: {value: []},
		only: {value: only},
		spec: {value: spec},
		description: {value: description}
	});
}

// Force to resolve on next tick so consumer can do something with previous iteration result
const onNextTick = val => new Promise(resolve => setTimeout(() => resolve(val), 0));

const PlanProto = {
	[Symbol.iterator]() {
		return this.items[Symbol.iterator]();
	},
	test(description, spec, opts) {
		if (!spec && description.test) {
			// If it is a plan
			this.items.push(...description);
		} else {
			this.items.push(test(description, spec, opts));
		}
		return this;
	},
	only(description, spec) {
		return this.test(description, spec, {only: true});
	},
	skip(description, spec) {
		if (!spec && description.test) {
			// If it is a plan we skip the whole plan
			for (const t of description) {
				this.items.push(t.skip());
			}
		} else {
			this.items.push(skip(description));
		}
		return this;
	}
};

const runnify = fn => async function (sink = tap()) {
	const sinkIterator = sink();
	sinkIterator.next();
	try {
		const hasOnly = this.items.some(t => t.only);
		const tests = hasOnly ? this.items.map(t => t.only ? t : t.skip()) : this.items;
		await fn(tests, sinkIterator);
	} catch (err) {
		sinkIterator.throw(err);
	} finally {
		sinkIterator.return();
	}
};

function factory({sequence = false} = {sequence: false}) {
	/* eslint-disable no-await-in-loop */
	const exec = sequence === true ? async (tests, sinkIterator) => {
		for (const t of tests) {
			const result = await onNextTick(t.run());
			sinkIterator.next(result);
		}
	} : async (tests, sinkIterator) => {
		const runningTests = tests.map(t => t.run());
		for (const r of runningTests) {
			const executedTest = await onNextTick(r);
			sinkIterator.next(executedTest);
		}
	};
	/* eslint-enable no-await-in-loop */

	return Object.assign(Object.create(PlanProto, {
		items: {value: []}, length: {
			get() {
				return this.items.length;
			}
		}
	}), {
		run: runnify(exec)
	});
}

module.exports = factory;
