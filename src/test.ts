import {assert, TestResult} from './assertion';
import {assertionMessage, bailout, endTestMessage, Message, startTestMessage} from './protocol';

/**
 * A Test is defined by test function collecting assertion results: it runs eagerly in its own micro task as soon as it is created.
 * However the result of the test routine can be awaited in the calling context (likely a parent test). This allows to fully manage the control flow within your tests.
 * The Test produces a stream of messages defined by the protocol in @link(./protocol.ts)
 * A Test is also a Result and may be used to emit an assertion result message in the parent context.
 */
export interface Test extends AsyncIterable<Message<any>>, TestResult {
    readonly routine: Promise<any>;
    readonly length: number;
    readonly fullLength: number;
}

export const defaultTestOptions = Object.freeze({
    offset: 0,
    skip: false
});

// todo directive (todo & skip)
export const tester = (description, spec, {offset = 0, skip = false} = defaultTestOptions): Test => {
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
