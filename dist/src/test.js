import { assert } from './assertion';
import { assertionMessage, bailout, endTestMessage, startTestMessage } from './protocol';
export const defaultTestOptions = Object.freeze({
    offset: 0,
    skip: false
});
// todo directive (todo & skip)
export const tester = (description, spec, { offset = 0, skip = false } = defaultTestOptions) => {
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
                    if (assertion.error !== null) {
                        // Bubble up the error and return
                        error = assertion.error;
                        pass = false;
                        return;
                    }
                }
                yield assertionMessage(assertion, offset);
                pass = pass && assertion.pass;
            }
            return error !== null ? yield bailout(error, offset) : yield endTestMessage(this, offset);
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
        },
        error: {
            get() {
                return error;
            }
        }
    });
};
