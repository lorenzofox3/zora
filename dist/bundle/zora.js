(function () {
    'use strict';

    const isAssertionResult = (result) => {
        return 'operator' in result;
    };
    const getAssertionLocation = () => {
        const err = new Error();
        const stack = (err.stack || '').split('\n');
        return (stack[3] || '').trim().replace(/^at/i, '');
    };
    const assertMethodHook = (fn) => function (actual, ...rest) {
        const assertResult = fn(actual, ...rest);
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
    const assert = (collect, offset) => {
        return Object.assign(Object.create(AssertPrototype, { collect: { value: collect } }), {
            test(description, spec, opts = defaultTestOptions) {
                const subTest = tester(description, spec, Object.assign({}, defaultTestOptions, opts, { offset: offset + 1 }));
                collect(subTest);
                return subTest.routine;
            }
        });
    };

    const startTestMessage = (test, offset) => ({
        type: "TEST_START" /* TEST_START */,
        data: test,
        offset
    });
    const assertionMessage = (assertion, offset) => ({
        type: "ASSERTION" /* ASSERTION */,
        data: assertion,
        offset
    });
    const endTestMessage = (test, offset) => ({
        type: "TEST_END" /* TEST_END */,
        data: test,
        offset
    });

    const defaultTestOptions = Object.freeze({
        offset: 0,
        skip: false
    });
    // todo directive (todo & skip)
    // todo plan
    const tester = (description, spec, { offset = 0, skip = false } = defaultTestOptions) => {
        let id = 0;
        let pass = true;
        let executionTime = 0;
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
                // todo bailout
                console.log(e);
            }
        })();
        return Object.defineProperties({
            [Symbol.asyncIterator]: async function* () {
                yield startTestMessage({ description }, offset);
                await testRoutine;
                for (const assertion of assertions) {
                    assertion.id = ++id;
                    if (assertion[Symbol.asyncIterator]) {
                        // Sub test
                        yield* assertion;
                        // yield endTestMessage(assertion, offset); // todo merge end test and plan and replace this one by an assertion
                    }
                    yield assertionMessage(assertion, offset);
                    pass = pass && assertion.pass;
                }
                yield endTestMessage(this, offset);
            }
        }, {
            routine: {
                value: testRoutine
            },
            description: {
                value: description
            },
            pass: {
                get() {
                    return pass;
                }
            },
            executionTime: {
                get() {
                    return executionTime;
                }
            },
            length: {
                get() {
                    return id;
                }
            }
        });
    };

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
    const printComment = (message) => {
        print(`# ${message.data}`, message.offset);
    };
    const printTitle = (message) => {
        const { data } = message;
        print(`# ${data.description}`, message.offset);
    };
    const printAssert = (message) => {
        const { data, offset } = message;
        const { pass, description, id } = data;
        const label = pass === true ? 'ok' : 'not ok';
        if (isAssertionResult(data)) {
            print(`${label} ${id} - ${description}`, offset);
            if (pass === false) {
                const { expected, actual, at, operator } = data;
                printYAML({ expected, actual, at, operator }, offset);
            }
        }
        else {
            print(`${pass ? 'ok' : 'not ok'} ${id} - ${description} # ${data.executionTime}ms`, message.offset);
        }
    };
    const printTest = (message) => {
        const { length } = message.data;
        print(`1..${length}`, message.offset);
    };
    // const printPlan = (message: PlanSummaryMessage): void => {
    //     const {data, offset} = message;
    //     print(`1..${data}`, offset);
    // };
    const tap = (message) => {
        switch (message.type) {
            case "TEST_START" /* TEST_START */:
                printTitle(message);
                break;
            case "ASSERTION" /* ASSERTION */:
                printAssert(message);
                break;
            case "TEST_END" /* TEST_END */:
                printTest(message);
                break;
            case "COMMENT" /* COMMENT */:
                printComment(message);
                break;
        }
    };
    const reporter = async (stream) => {
        print('TAP version 13');
        for await (const message of stream) {
            tap(message);
        }
        // summary
    };

    // with two arguments
    const curry = (fn) => (a, b) => b === void 0 ? b => fn(a, b) : fn(a, b);
    const toCurriedIterable = gen => curry((a, b) => ({
        [Symbol.asyncIterator]() {
            return gen(a, b);
        }
    }));

    const filter = toCurriedIterable(async function* (fn, asyncIterable) {
        let index = 0;
        for await (const i of asyncIterable) {
            if (fn(i, index, asyncIterable) === true) {
                yield i;
            }
            index++;
        }
    });

    let autoStart = true;
    async function* flatten(iterable) {
        for (const iter of iterable) {
            yield* iter;
        }
    }
    const harnessFactory = (reporter$$1 = reporter) => {
        const tests = [];
        const test = (description, specFn, opts = defaultTestOptions) => {
            tests.push(tester(description, specFn, opts));
        };
        return {
            test,
            run: async () => {
                //todo print plan
                return reporter$$1(filter((message) => message.type !== "TEST_END" /* TEST_END */ || message.offset > 0, flatten(tests)));
            }
        };
    };
    const defaultTestHarness = harnessFactory();
    const test = defaultTestHarness.test;
    const start = () => {
        if (autoStart) {
            defaultTestHarness.run();
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

    const wait = (time = 500) => new Promise(resolve => {
        setTimeout(() => resolve(), time);
    });
    test('another one', async (t) => {
        // console.time('another one');
        await wait(1000);
        t.ok('foo', 'foo is truthy');
        // console.timeEnd('another one');
    });
    test('a simple tester', async (t) => {
        // console.time('a simple tester');
        t.is(3, 2, 'should fail');
        await wait(700);
        await t.test('inside', async (t) => {
            // console.time('inside');
            await wait(800);
            t.is('insider', 'insidrer', 'from insider');
            // console.timeEnd('inside');
        });
        t.test('inside not waiting', async (t) => {
            // console.time('inside not waiting');
            t.test('deep inside not waiting', async (t) => {
                // console.time('deep inside not waiting');
                await wait(400);
                t.is('bar', 'bar', 'bar');
                // console.timeEnd('deep inside not waiting');
            });
            await t.test('deep inside', async (t) => {
                // console.time('deep inside');
                await wait(200);
                t.is('foo', 'foo', 'deep inside assert');
                // console.timeEnd('deep inside');
            });
            // console.timeEnd('inside not waiting');
        });
        t.is(4, 4, 'four should be four bis');
        // console.timeEnd('a simple tester');
    });

}());
//# sourceMappingURL=zora.js.map
