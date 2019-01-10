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
// todo directive (todo & skip)
const tester = (description, spec, { offset = 0, skip = false } = defaultTestOptions) => {
    let id = 0;
    let pass = true;
    let executionTime = 0;
    let error = null;
    const assertions = [];
    const collect = item => assertions.push(item);
    const testRoutine = (async function () {
        try {
            const start = Date.now();
            const result = await spec(assert(collect, offset));
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
                }
                yield assertionMessage(assertion, offset);
                pass = pass && assertion.pass;
            }
            if (error !== null) {
                return yield bailout(error, 0);
            }
            yield endTestMessage(this, offset);
        }
    }, {
        routine: {
            value: testRoutine
        },
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
            enumerable: true,
            get() {
                return assertions.length;
            }
        },
        fullLength: {
            enumerable: true,
            get() {
                return assertions.reduce((acc, curr) => acc + (curr.fullLength !== void 0 ? curr.fullLength : 1), 0);
            }
        }
    });
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
        pass: Object.is(actual, expected),
        actual,
        expected,
        description,
        operator: "equal" /* EQUAL */
    })),
    equals: aliasMethodHook('equal'),
    eq: aliasMethodHook('equal'),
    deepEqual: aliasMethodHook('equal'),
    notEqual: assertMethodHook((actual, expected, description = 'should not be equivalent') => ({
        pass: Object.is(actual, expected),
        actual,
        expected,
        description,
        operator: "notEqual" /* NOT_EQUAL */
    })),
    notEquals: aliasMethodHook('notEqual'),
    notEq: aliasMethodHook('notEqual'),
    notDeepEqual: aliasMethodHook('notEqual'),
    is: assertMethodHook((actual, expected, description = 'should be the same value') => ({
        pass: Object.is(actual, expected),
        actual,
        expected,
        description,
        operator: "is" /* IS */
    })),
    same: aliasMethodHook('is'),
    isNot: assertMethodHook((actual, expected, description = 'should not be the same value') => ({
        pass: !Object.is(actual, expected),
        actual,
        expected,
        description,
        operator: "isNot" /* IS_NOT */
    })),
    notSame: aliasMethodHook('isNot'),
    ok: assertMethodHook((actual, description = 'should be the truthy') => ({
        pass: Boolean(actual),
        actual,
        expected: true,
        description,
        operator: "ok" /* OK */
    })),
    truthy: aliasMethodHook('ok'),
    notOk: assertMethodHook((actual, description = 'should be the falsy') => ({
        pass: !Boolean(actual),
        actual,
        expected: true,
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
        print(`${pass ? 'ok' : 'not ok'} ${id} - ${description} # ${data.executionTime}ms`, message.offset);
    }
};
const tapeAssert = assertPrinter(val => val);
const testPrinter = (lengthProp) => (message) => {
    const length = message.data[lengthProp];
    const { offset } = message;
    if (offset === 0) {
        print('');
    }
    print(`1..${length}`, offset);
    if (offset === 0) {
        comment(message.data.pass ? 'ok' : 'not ok', 0);
    }
};
const tapeTest = testPrinter('fullLength');
const printBailout = (message) => {
    print('Bail out! Unhandled error.');
};
const reportAsTapeTap = (message) => {
    switch (message.type) {
        case "TEST_START" /* TEST_START */:
            tapeSubTest(message);
            break;
        case "ASSERTION" /* ASSERTION */:
            tapeAssert(message);
            break;
        case "TEST_END" /* TEST_END */:
            tapeTest(message);
            break;
        case "BAIL_OUT" /* BAIL_OUT */:
            printBailout(message);
            throw message.data;
    }
};
const flatFilter = filter((message) => {
    return message.type === "TEST_START" /* TEST_START */
        || message.type === "BAIL_OUT" /* BAIL_OUT */
        || (message.type === "ASSERTION" /* ASSERTION */ && isAssertionResult(message.data))
        || (message.type === "TEST_END" /* TEST_END */ && message.offset === 0);
});
const flattenStream = (stream$$1) => {
    let id = 0;
    const mapper = map(message => {
        if (message.type === "ASSERTION" /* ASSERTION */) {
            const mappedData = Object.assign({}, message.data, { id: ++id });
            return assertionMessage(mappedData, 0);
        }
        return Object.assign({}, message, { offset: 0 });
    });
    return mapper(flatFilter(stream$$1));
};
const tapeTapLike = async (stream$$1) => {
    print('TAP version 13');
    for await (const message of flattenStream(stream$$1)) {
        reportAsTapeTap(message);
    }
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
            enumerable: true,
            get() {
                return tests.length;
            },
        },
        fullLength: {
            enumerable: true,
            get() {
                return tests.reduce((acc, curr) => acc + (curr.fullLength !== void 0 ? curr.fullLength : 1), 0);
            }
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
                }
                yield assertionMessage(t, rootOffset);
                pass = pass && t.pass;
            }
            yield endTestMessage(instance, rootOffset);
        },
        report: async (reporter = tapeTapLike) => {
            return reporter(instance);
        }
    });
};

let autoStart = true;
const defaultTestHarness = harnessFactory();
const test = defaultTestHarness.test.bind(defaultTestHarness);
const equal = defaultTestHarness.equal.bind(defaultTestHarness);
const notEqual = defaultTestHarness.notEqual.bind(defaultTestHarness);
const is = defaultTestHarness.is.bind(defaultTestHarness);
const isNot = defaultTestHarness.isNot.bind(defaultTestHarness);
const ok = defaultTestHarness.ok.bind(defaultTestHarness);
const notOk = defaultTestHarness.notOk.bind(defaultTestHarness);
const fail = defaultTestHarness.fail.bind(defaultTestHarness);
const throws = defaultTestHarness.throws.bind(defaultTestHarness);
const doesNotThrow = defaultTestHarness.doesNotThrow.bind(defaultTestHarness);
const start = () => {
    if (autoStart) {
        defaultTestHarness.report();
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

// const harness = createHarness();
// const {test: htest, is: his, ok: hok} = harness;
//
// const test = htest.bind(harness);
// const is = his.bind(harness);
// const ok = hok.bind(harness);
const wait = (time = 500) => new Promise(resolve => {
    setTimeout(() => resolve(), time);
});
test('a simple tester', async (t) => {
    t.is(3, 2, 'should fail');
    await wait(700);
    await t.test('inside', async (t) => {
        await wait(800);
        t.is('insider', 'insider', 'from insider');
    });
    t.test('inside not waiting', async (t) => {
        t.test('deep inside not waiting', async (t) => {
            await wait(400);
            t.ok('another one', 'another one');
            t.is('bar', 'bart', 'bar');
        });
        await t.test('deep inside', async (t) => {
            await wait(200);
            t.is('foo', 'foo', 'deep inside assert');
        });
    });
    t.is(4, 4, 'four should be four bis');
});
test('another one', async (t) => {
    await wait(1000);
    t.ok('foo', 'foo is truthy');
    t.ok('foobis', 'foobis is truthy');
});
// is('foo', 'foo', 'a foo test');
// ok(false);
// is('what', 'what', 'a what test');
// harness.report(mochaTapLike);
//# sourceMappingURL=zora.es.js.map
