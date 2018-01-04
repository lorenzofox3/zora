import deepEqual from 'deep-equal';

const assertMethodHook = fn => function (...args) {
	const assertResult = fn(...args);
	this.collect(assertResult);
	return assertResult;
};

const Assertion = {
	ok: assertMethodHook((val, message = 'should be truthy') => ({
		pass: Boolean(val),
		actual: val,
		expected: 'truthy',
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
		expected: 'falsy',
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

export default collect => Object.create(Assertion, {collect: {value: collect}});
