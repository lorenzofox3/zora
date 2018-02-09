var zora = (function () {
'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var keys = createCommonjsModule(function (module, exports) {
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}
});

var keys_1 = keys.shim;

var is_arguments = createCommonjsModule(function (module, exports) {
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
}
});

var is_arguments_1 = is_arguments.supported;
var is_arguments_2 = is_arguments.unsupported;

var deepEqual_1 = createCommonjsModule(function (module) {
var pSlice = Array.prototype.slice;



var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
};

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (is_arguments(a)) {
    if (!is_arguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = keys(a),
        kb = keys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}
});

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
	ok: assertMethodHook((val, description = 'should be truthy') => ({
		pass: Boolean(val),
		actual: val,
		expected: true,
		description,
		operator: 'ok'
	})),
	deepEqual: assertMethodHook((actual, expected, description = 'should be equivalent') => ({
		pass: deepEqual_1(actual, expected),
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
		pass: !deepEqual_1(actual, expected),
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
			description: description || 'should not throw'
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

var assert = (collect, test) => Object.assign(
	Object.create(Assertion, {collect: {value: collect}}), {
		async test(description, spec) {
			// Note: we return the task so the caller can control whether he wants to wait for the sub test to complete or not
			return test(description, spec).task;
		}
	});

const tester = (collect, {offset = 0} = {}) => (description, spec) => {
	const buffer = [{type: 'title', data: description, offset}];
	const result = {count: 0, pass: true, description, spec};
	let done = false;

	const createAssertion = item => {
		result.pass = result.pass && item.pass;
		return {type: 'assert', data: item, offset};
	};

	const collector = item => {
		result.count++;
		item.id = result.count;
		if (item[Symbol.asyncIterator] === undefined) {
			// Assertion
			buffer.push(createAssertion(item));
		} else {
			// Sub test
			buffer.push(item);
		}
	};

	const handleDelegate = async delegate => {
		const {value, done} = await delegate.next();

		// Delegate is exhausted: create a summary test point in the stream and throw the delegate
		if (done === true) {
			const {executionTime, pass, description} = value;
			const subTestAssertion = Object.assign(createAssertion({
				pass,
				description,
				id: delegate.id,
				executionTime
			}), {type: 'testAssert'});
			buffer.shift();
			buffer.unshift(subTestAssertion);
			return instance.next();
		}
		return {value, done};
	};

	const subTest = tester(collector, {offset: offset + 1});

	const start = Date.now();
	// Execute the test collecting assertions
	const assertFn = assert(collector, subTest);
	const task = new Promise(resolve => resolve(spec(assertFn)))
		.then(() => {
			// Always report a plan and summary: the calling test will know how to deal with it
			result.executionTime = Date.now() - start;
			buffer.push({type: 'plan', data: {start: 1, end: result.count}, offset});
			buffer.push({type: 'time', data: result.executionTime, offset});
			done = true;
			return result;
		})
		.catch(err => {
			// We report a failing test before bail out ... while unhandled promise rejection is still allowed by nodejs...
			buffer.push({type: 'assert', data: {pass: false, description}});
			buffer.push({type: 'comment', data: 'Unhandled exception'});
			buffer.push({type: 'bailout', data: err, offset});
			done = true;
		});

	const instance = {
		test: subTest,
		task,
		[Symbol.asyncIterator]() {
			return this;
		},
		async next() {
			if (buffer.length === 0) {
				if (done === true) {
					return {done: true, value: result};
				}
				// Flush
				await task;
				return this.next();
			}

			const next = buffer[0];

			// Delegate if sub test
			if (next[Symbol.asyncIterator] !== undefined) {
				return handleDelegate(next);
			}

			return {value: buffer.shift(), done: false};
		}
	};

	// Collection by the calling test
	collect(instance);

	return instance;
};

const print = (message, offset = 0) => {
	console.log(message.padStart(message.length + (offset * 4))); // 4 white space used as indent (see tap-parser)
};

const toYaml = print => (obj, offset = 0) => {
	for (const [prop, value] of Object.entries(obj)) {
		print(`${prop}: ${JSON.stringify(value)}`, offset + 0.5);
	}
};

const tap = print => {
	const yaml = toYaml(print);
	return {
		version(version = 13) {
			print(`TAP version ${version}`);
		},
		title(value, offset = 0) {
			const message = offset > 0 ? `Subtest: ${value}` : value;
			this.comment(message, offset);
		},
		assert(value, offset = 0) {
			const {pass, description, id, executionTime, expected = '', actual = '', at = '', operator = ''} = value;
			const label = pass === true ? 'ok' : 'not ok';
			print(`${label} ${id} - ${description}${executionTime ? ` # time=${executionTime}ms` : ''}`, offset);
			if (pass === false && value.operator) {
				print('---', offset + 0.5);
				yaml({expected, actual, at, operator}, offset);
				print('...', offset + 0.5);
			}
		},
		plan(value, offset = 0) {
			print(`1..${value.end}`, offset);
		},
		time(value, offset = 0) {
			this.comment(`time=${value}ms`, offset);
		},
		comment(value, offset = 0) {
			print(`# ${value}`, offset);
		},
		bailout(value = 'Unhandled exception') {
			print(`Bail out! ${value}`);
		},
		testAssert(value, offset = 0) {
			return this.assert(value, offset);
		}
	};
};

var tap$1 = (printFn = print) => {
	const reporter = tap(printFn);
	return (toPrint = {}) => {
		const {data, type, offset = 0} = toPrint;
		if (typeof reporter[type] === 'function') {
			reporter[type](data, offset);
		}
		// Else ignore (unknown message type)
	};
};

// Some combinators for asynchronous iterators: this will be way more easier when
// Async generator are widely supported

const asyncIterator = behavior => Object.assign({
	[Symbol.asyncIterator]() {
		return this;
	}
}, behavior);

const filter = predicate => iterator => asyncIterator({
	async next() {
		const {done, value} = await iterator.next();

		if (done === true) {
			return {done};
		}

		if (!predicate(value)) {
			return this.next();
		}

		return {done, value};
	}
});

const map = mapFn => iterator => asyncIterator({
	[Symbol.asyncIterator]() {
		return this;
	},
	async next() {
		const {done, value} = await iterator.next();
		if (done === true) {
			return {done};
		}
		return {done, value: mapFn(value)};
	}
});

const stream = asyncIterator => Object.assign(asyncIterator, {
	map(fn) {
		return stream(map(fn)(asyncIterator));
	},
	filter(fn) {
		return stream(filter(fn)(asyncIterator));
	}
});

const combine = (...iterators) => {
	const [...pending] = iterators;
	let current = pending.shift();

	return asyncIterator({
		async next() {
			if (current === undefined) {
				return {done: true};
			}

			const {done, value} = await current.next();

			if (done === true) {
				current = pending.shift();
				return this.next();
			}

			return {done, value};
		}
	});
};

let flatten = true;
const tests = [];
const test = tester(t => tests.push(t));

// Provide a root context for BSD style test suite
const subTest = (test('Root', () => {})).test;
test.test = (description, spec) => {
	flatten = false; // Turn reporter into BSD style
	return subTest(description, spec);
};

const start = async ({reporter = tap$1()} = {}) => {
	let count = 0;
	let failure = 0;
	reporter({type: 'version', data: 13});

	// Remove the irrelevant root title
	await tests[0].next();

	let outputStream = stream(combine(...tests));
	outputStream = flatten ? outputStream
		.filter(({type}) => type !== 'testAssert')
		.map(item => Object.assign(item, {offset: 0})) :
		outputStream;

	const filterOutAtRootLevel = ['plan', 'time'];
	outputStream = outputStream
		.filter(item => item.offset > 0 || !filterOutAtRootLevel.includes(item.type))
		.map(item => {
			if (item.offset > 0 || (item.type !== 'assert' && item.type !== 'testAssert')) {
				return item;
			}

			count++;
			item.data.id = count;
			failure += item.data.pass ? 0 : 1;
			return item;
		});

	// One day with for await loops ... :) !
	while (true) {
		const {done, value} = await outputStream.next();

		if (done === true) {
			break;
		}

		reporter(value);

		if (value.type === 'bailout') {
			throw value.data; // Rethrow but with Nodejs we keep getting the deprecation warning (unhandled promise) and the process exists with 0 exit code...
		}
	}

	reporter({type: 'plan', data: {start: 1, end: count}});
	reporter({type: 'comment', data: failure > 0 ? `failed ${failure} of ${count} tests` : 'ok'});
};

// Auto bootstrap following async env vs sync env (browser vs node)
if (typeof window === 'undefined') {
	setTimeout(start, 0);
} else {
	window.addEventListener('load', start);
}

return test;

}());
//# sourceMappingURL=zora.js.map
