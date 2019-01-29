'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Emitted when a new sub test has started
 * @param {{description}} test - A Test
 * @param {number} offset - give the nested level
 * @returns {StartTestMessage}
 */
const startTestMessage = (test, offset) => ({
    type: "TEST_START" /* TEST_START */,
    data: test,
    offset
});
/**
 * Emitted when an assertion result is produced. Note than when a sub test finishes, it also emits an assertion result in the parent sub test stream
 * @param {TestResult | AssertionResult} assertion
 * @param {number} offset - give the nested level
 * @returns {AssertionMessage}
 */
const assertionMessage = (assertion, offset) => ({
    type: "ASSERTION" /* ASSERTION */,
    data: assertion,
    offset
});
/**
 * Emitted when a sub tests finishes
 * @param {Test} test - The Sub test
 * @param {number} offset - the nested level
 * @returns {TestEndMessage}
 */
const endTestMessage = (test, offset) => ({
    type: "TEST_END" /* TEST_END */,
    data: test,
    offset
});
/**
 * Emitted when an error is not handled
 * @param {Error} error
 * @param {number} offset
 * @returns {BailoutMessage}
 */
const bailout = (error, offset) => ({
    type: "BAIL_OUT" /* BAIL_OUT */,
    data: error,
    offset
});

const defaultTestOptions = Object.freeze({
    offset: 0,
    skip: false
});
const noop = () => {
};
const tester = (description, spec, { offset = 0, skip = false } = defaultTestOptions) => {
    let id = 0;
    let successCount = 0;
    let failureCount = 0;
    let skipCount = 0;
    let pass = true;
    let executionTime = 0;
    let error = null;
    const specFunction = skip === true ? noop : spec;
    const assertions = [];
    const collect = item => assertions.push(item);
    const updateCount = (assertion) => {
        const { pass, skip } = assertion;
        if (!isAssertionResult(assertion)) {
            skipCount += assertion.skipCount;
            successCount += assertion.successCount;
            failureCount += assertion.failureCount;
        }
        else if (pass) {
            if (skip === true) {
                skipCount++;
            }
            else {
                successCount++;
            }
        }
        else {
            failureCount++;
        }
    };
    const testRoutine = (async function () {
        try {
            const start = Date.now();
            const result = await specFunction(assert(collect, offset));
            executionTime = Date.now() - start;
            return result;
        }
        catch (e) {
            error = e;
        }
    })();
    return Object.defineProperties({
        [Symbol.asyncIterator]: async function* () {
            await testRoutine;
            for (const assertion of assertions) {
                assertion.id = ++id;
                if (assertion[Symbol.asyncIterator]) {
                    // Sub test
                    yield startTestMessage({ description: assertion.description }, offset);
                    yield* assertion;
                    if (assertion.error !== null) {
                        // Bubble up the error and return
                        error = assertion.error;
                        pass = false;
                        return;
                    }
                }
                yield assertionMessage(assertion, offset);
                pass = pass && assertion.pass;
                updateCount(assertion);
            }
            return error !== null ?
                yield bailout(error, offset) :
                yield endTestMessage(this, offset);
        }
    }, {
        description: {
            value: description,
            enumerable: true
        },
        pass: {
            enumerable: true,
            get() {
                return pass;
            }
        },
        executionTime: {
            enumerable: true,
            get() {
                return executionTime;
            }
        },
        length: {
            get() {
                return assertions.length;
            }
        },
        error: {
            get() {
                return error;
            }
        },
        skipCount: {
            get() {
                return skipCount;
            },
        },
        failureCount: {
            get() {
                return failureCount;
            }
        },
        successCount: {
            get() {
                return successCount;
            }
        },
        count: {
            get() {
                return skipCount + successCount + failureCount;
            }
        },
        routine: {
            value: testRoutine
        },
        skip: {
            value: skip
        }
    });
};

var isArray = Array.isArray;
var keyList = Object.keys;
var hasProp = Object.prototype.hasOwnProperty;

var fastDeepEqual = function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    var arrA = isArray(a)
      , arrB = isArray(b)
      , i
      , length
      , key;

    if (arrA && arrB) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }

    if (arrA != arrB) return false;

    var dateA = a instanceof Date
      , dateB = b instanceof Date;
    if (dateA != dateB) return false;
    if (dateA && dateB) return a.getTime() == b.getTime();

    var regexpA = a instanceof RegExp
      , regexpB = b instanceof RegExp;
    if (regexpA != regexpB) return false;
    if (regexpA && regexpB) return a.toString() == b.toString();

    var keys = keyList(a);
    length = keys.length;

    if (length !== keyList(b).length)
      return false;

    for (i = length; i-- !== 0;)
      if (!hasProp.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      key = keys[i];
      if (!equal(a[key], b[key])) return false;
    }

    return true;
  }

  return a!==a && b!==b;
};

const isAssertionResult = (result) => {
    return 'operator' in result;
};
const getAssertionLocation = () => {
    const err = new Error();
    const stack = (err.stack || '').split('\n');
    return (stack[3] || '').trim().replace(/^at/i, '');
};
const assertMethodHook = (fn) => function (...args) {
    // @ts-ignore
    const assertResult = fn(...args);
    if (assertResult.pass === false) {
        assertResult.at = getAssertionLocation();
    }
    this.collect(assertResult);
    return assertResult;
};
const aliasMethodHook = (methodName) => function (...args) {
    return this[methodName](...args);
};
const AssertPrototype = {
    equal: assertMethodHook((actual, expected, description = 'should be equivalent') => ({
        pass: fastDeepEqual(actual, expected),
        actual,
        expected,
        description,
        operator: "equal" /* EQUAL */
    })),
    equals: aliasMethodHook('equal'),
    eq: aliasMethodHook('equal'),
    deepEqual: aliasMethodHook('equal'),
    notEqual: assertMethodHook((actual, expected, description = 'should not be equivalent') => ({
        pass: !fastDeepEqual(actual, expected),
        actual,
        expected,
        description,
        operator: "notEqual" /* NOT_EQUAL */
    })),
    notEquals: aliasMethodHook('notEqual'),
    notEq: aliasMethodHook('notEqual'),
    notDeepEqual: aliasMethodHook('notEqual'),
    is: assertMethodHook((actual, expected, description = 'should be the same') => ({
        pass: Object.is(actual, expected),
        actual,
        expected,
        description,
        operator: "is" /* IS */
    })),
    same: aliasMethodHook('is'),
    isNot: assertMethodHook((actual, expected, description = 'should not be the same') => ({
        pass: !Object.is(actual, expected),
        actual,
        expected,
        description,
        operator: "isNot" /* IS_NOT */
    })),
    notSame: aliasMethodHook('isNot'),
    ok: assertMethodHook((actual, description = 'should be truthy') => ({
        pass: Boolean(actual),
        actual,
        expected: 'truthy value',
        description,
        operator: "ok" /* OK */
    })),
    truthy: aliasMethodHook('ok'),
    notOk: assertMethodHook((actual, description = 'should be falsy') => ({
        pass: !Boolean(actual),
        actual,
        expected: 'falsy value',
        description,
        operator: "notOk" /* NOT_OK */
    })),
    falsy: aliasMethodHook('notOk'),
    fail: assertMethodHook((description = 'fail called') => ({
        pass: false,
        actual: 'fail called',
        expected: 'fail not called',
        description,
        operator: "fail" /* FAIL */
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
        }
        catch (err) {
            caught = { error: err };
        }
        pass = caught !== undefined;
        actual = caught && caught.error;
        if (expected instanceof RegExp) {
            pass = expected.test(actual) || expected.test(actual && actual.message);
            actual = actual && actual.message || actual;
            expected = String(expected);
        }
        else if (typeof expected === 'function' && caught) {
            pass = actual instanceof expected;
            actual = actual.constructor;
        }
        return {
            pass,
            actual,
            expected,
            description: description || 'should throw',
            operator: "throws" /* THROWS */,
        };
    }),
    doesNotThrow: assertMethodHook((func, expected, description) => {
        let caught;
        if (typeof expected === 'string') {
            [expected, description] = [description, expected];
        }
        try {
            func();
        }
        catch (err) {
            caught = { error: err };
        }
        return {
            pass: caught === undefined,
            expected: 'no thrown error',
            actual: caught && caught.error,
            operator: "doesNotThrow" /* DOES_NOT_THROW */,
            description: description || 'should not throw'
        };
    })
};
const assert = (collect, offset) => Object.assign(Object.create(AssertPrototype, { collect: { value: collect } }), {
    test(description, spec, opts = defaultTestOptions) {
        const subTest = tester(description, spec, Object.assign({}, defaultTestOptions, opts, { offset: offset + 1 }));
        collect(subTest);
        return subTest.routine;
    },
    skip(description, spec, opts = defaultTestOptions) {
        return this.test(description, spec, Object.assign({}, opts, { skip: true }));
    }
});

// with two arguments
const curry = (fn) => (a, b) => b === void 0 ? b => fn(a, b) : fn(a, b);
const toCurriedIterable = gen => curry((a, b) => ({
    [Symbol.asyncIterator]() {
        return gen(a, b);
    }
}));

const map = toCurriedIterable(async function* (fn, asyncIterable) {
    let index = 0;
    for await (const i of asyncIterable) {
        yield fn(i, index, asyncIterable);
        index++;
    }
});

const filter = toCurriedIterable(async function* (fn, asyncIterable) {
    let index = 0;
    for await (const i of asyncIterable) {
        if (fn(i, index, asyncIterable) === true) {
            yield i;
        }
        index++;
    }
});

const print = (message, offset = 0) => {
    console.log(message.padStart(message.length + (offset * 4))); // 4 white space used as indent (see tap-parser)
};
const printYAML = (obj, offset = 0) => {
    const YAMLOffset = offset + 0.5;
    print('---', YAMLOffset);
    for (const [prop, value] of Object.entries(obj)) {
        print(`${prop}: ${JSON.stringify(value)}`, YAMLOffset);
    }
    print('...', YAMLOffset);
};
const comment = (value, offset) => {
    print(`# ${value}`, offset);
};
const subTestPrinter = (prefix = '') => (message) => {
    const { data } = message;
    const value = `${prefix}${data.description}`;
    comment(value, message.offset);
};
const mochaTapSubTest = subTestPrinter('Subtest: ');
const tapeSubTest = subTestPrinter();
const assertPrinter = (diagnostic) => (message) => {
    const { data, offset } = message;
    const { pass, description, id } = data;
    const label = pass === true ? 'ok' : 'not ok';
    if (isAssertionResult(data)) {
        print(`${label} ${id} - ${description}`, offset);
        if (pass === false) {
            printYAML(diagnostic(data), offset);
        }
    }
    else {
        const comment = data.skip === true ? 'SKIP' : `${data.executionTime}ms`;
        print(`${pass ? 'ok' : 'not ok'} ${id} - ${description} # ${comment}`, message.offset);
    }
};
const tapeAssert = assertPrinter(({ id, pass, description, ...rest }) => rest);
const mochaTapAssert = assertPrinter(({ expected, id, pass, description, actual, operator, at, ...rest }) => ({
    wanted: expected,
    found: actual,
    at,
    operator,
    ...rest
}));
const testEnd = (message) => {
    const length = message.data.length;
    const { offset } = message;
    print(`1..${length}`, offset);
};
const printBailout = (message) => {
    print('Bail out! Unhandled error.');
};
const reportAsMochaTap = (message) => {
    switch (message.type) {
        case "TEST_START" /* TEST_START */:
            mochaTapSubTest(message);
            break;
        case "ASSERTION" /* ASSERTION */:
            mochaTapAssert(message);
            break;
        case "TEST_END" /* TEST_END */:
            testEnd(message);
            break;
        case "BAIL_OUT" /* BAIL_OUT */:
            printBailout(message);
            throw message.data;
    }
};
const reportAsTapeTap = (message) => {
    switch (message.type) {
        case "TEST_START" /* TEST_START */:
            tapeSubTest(message);
            break;
        case "ASSERTION" /* ASSERTION */:
            tapeAssert(message);
            break;
        case "BAIL_OUT" /* BAIL_OUT */:
            printBailout(message);
            throw message.data;
    }
};
const flatFilter = filter((message) => {
    return message.type === "TEST_START" /* TEST_START */
        || message.type === "BAIL_OUT" /* BAIL_OUT */
        || (message.type === "ASSERTION" /* ASSERTION */ && (isAssertionResult(message.data) || message.data.skip === true));
});
const flattenStream = (stream$$1) => {
    let id = 0;
    const mapper = map(message => {
        if (message.type === "ASSERTION" /* ASSERTION */) {
            const mappedData = Object.assign(message.data, { id: ++id });
            return assertionMessage(mappedData, 0);
        }
        return Object.assign({}, message, { offset: 0 });
    });
    return mapper(flatFilter(stream$$1));
};
const printSummary = (harness) => {
    print('', 0);
    comment(harness.pass ? 'ok' : 'not ok', 0);
    comment(`success: ${harness.successCount}`, 0);
    comment(`skipped: ${harness.skipCount}`, 0);
    comment(`failure: ${harness.failureCount}`, 0);
};
const tapeTapLike = async (stream$$1) => {
    print('TAP version 13');
    const streamInstance = flattenStream(stream$$1);
    for await (const message of streamInstance) {
        reportAsTapeTap(message);
    }
    print(`1..${stream$$1.count}`, 0);
    printSummary(stream$$1);
};
const mochaTapLike = async (stream$$1) => {
    print('TAP version 13');
    for await (const message of stream$$1) {
        reportAsMochaTap(message);
    }
    printSummary(stream$$1);
};

const harnessFactory = () => {
    const tests = [];
    const rootOffset = 0;
    let pass = true;
    let id = 0;
    const collect = item => tests.push(item);
    const api = assert(collect, rootOffset);
    const instance = Object.create(api, {
        length: {
            get() {
                return tests.length;
            },
        },
        pass: {
            get() {
                return pass;
            }
        },
        count: {
            get() {
                return this.successCount + this.failureCount + this.skipCount;
            }
        },
        successCount: {
            get() {
                return tests.reduce((acc, curr) => acc + curr.successCount, 0);
            },
        },
        failureCount: {
            get() {
                return tests.reduce((acc, curr) => acc + curr.failureCount, 0);
            },
        },
        skipCount: {
            get() {
                return tests.reduce((acc, curr) => acc + curr.skipCount, 0);
            },
        }
    });
    return Object.assign(instance, {
        [Symbol.asyncIterator]: async function* () {
            for (const t of tests) {
                t.id = ++id;
                if (t[Symbol.asyncIterator]) {
                    // Sub test
                    yield startTestMessage({ description: t.description }, rootOffset);
                    yield* t;
                    if (t.error !== null) {
                        pass = false;
                        return;
                    }
                }
                yield assertionMessage(t, rootOffset);
                pass = pass && t.pass;
            }
            yield endTestMessage(this, 0);
        },
        report: async (reporter = tapeTapLike) => {
            return reporter(instance);
        }
    });
};

let autoStart = true;
let indent = false;
const defaultTestHarness = harnessFactory();
const rootTest = defaultTestHarness.test.bind(defaultTestHarness);
rootTest.indent = () => indent = true;
const test = rootTest;
const skip$1 = (description, spec, options = {}) => rootTest(description, spec, Object.assign({}, options, { skip: true }));
rootTest.skip = skip$1;
const equal = defaultTestHarness.equal.bind(defaultTestHarness);
const equals = equal;
const eq = equal;
const deepEqual = equal;
const notEqual = defaultTestHarness.notEqual.bind(defaultTestHarness);
const notEquals = notEqual;
const notEq = notEqual;
const notDeepEqual = notEqual;
const is = defaultTestHarness.is.bind(defaultTestHarness);
const same = is;
const isNot = defaultTestHarness.isNot.bind(defaultTestHarness);
const notSame = isNot;
const ok = defaultTestHarness.ok.bind(defaultTestHarness);
const truthy = ok;
const notOk = defaultTestHarness.notOk.bind(defaultTestHarness);
const falsy = notOk;
const fail = defaultTestHarness.fail.bind(defaultTestHarness);
const throws = defaultTestHarness.throws.bind(defaultTestHarness);
const doesNotThrow = defaultTestHarness.doesNotThrow.bind(defaultTestHarness);
/**
 * If you create a test harness manually, report won't start automatically and you will
 * have to call the report method yourself. This can be handy if you wish to use another reporter
 * @returns {TestHarness}
 */
const createHarness = () => {
    autoStart = false;
    return harnessFactory();
};
const start = () => {
    if (autoStart) {
        defaultTestHarness.report(indent ? mochaTapLike : tapeTapLike);
    }
};
// on next tick start reporting
// @ts-ignore
if (typeof window === 'undefined') {
    setTimeout(start, 0);
}
else {
    // @ts-ignore
    window.addEventListener('load', start);
}

exports.test = test;
exports.skip = skip$1;
exports.equal = equal;
exports.equals = equals;
exports.eq = eq;
exports.deepEqual = deepEqual;
exports.notEqual = notEqual;
exports.notEquals = notEquals;
exports.notEq = notEq;
exports.notDeepEqual = notDeepEqual;
exports.is = is;
exports.same = same;
exports.isNot = isNot;
exports.notSame = notSame;
exports.ok = ok;
exports.truthy = truthy;
exports.notOk = notOk;
exports.falsy = falsy;
exports.fail = fail;
exports.throws = throws;
exports.doesNotThrow = doesNotThrow;
exports.createHarness = createHarness;
exports.tapeTapLike = tapeTapLike;
exports.mochaTapLike = mochaTapLike;
exports.AssertPrototype = AssertPrototype;
exports.assert = assert;
