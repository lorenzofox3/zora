import {assert, AssertionResult, isAssertionResult, Result, TestResult} from './assertion';
import {assertionMessage, bailout, endTestMessage, Message, startTestMessage} from './protocol';

export interface TestGroup {
    successCount: number;
    failureCount: number;
    skipCount: number;
    count: number;
}

/**
 * A Test is defined by test function collecting assertion results: it runs eagerly in its own micro task as soon as it is created.
 * However the result of the test routine can be awaited in the calling context (likely a parent test). This allows to fully manage the control flow within your tests.
 * The Test produces a stream of messages defined by the protocol in @link(./protocol.ts)
 * A Test is also a Result and may be used to emit an assertion result message in the parent context.
 */
export interface Test extends AsyncIterable<Message<any>>, TestResult, TestGroup {
    readonly routine: Promise<any>;
    readonly length: number;
    readonly error?: any;
}

export const defaultTestOptions = Object.freeze({
    offset: 0,
    skip: false
});

const noop = () => {
};

export const tester = (description, spec, {offset = 0, skip = false} = defaultTestOptions): Test => {
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
    const updateCount = (assertion: AssertionResult | Test): void => {
        const {pass, skip} = assertion;
        if (!isAssertionResult(assertion)) {
            skipCount += assertion.skipCount;
            successCount += assertion.successCount;
            failureCount += assertion.failureCount;
        } else if (pass) {
            if (skip === true) {
                skipCount++;
            } else {
                successCount++;
            }

        } else {
            failureCount++;
        }
    };

    const testRoutine = (async function () {
        try {
            const start = Date.now();
            const result = await specFunction(assert(collect, offset));
            executionTime = Date.now() - start;
            return result;
        } catch (e) {
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
                    yield startTestMessage({description: assertion.description}, offset);
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
