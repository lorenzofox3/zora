import { assert } from './assertion';
import { assertionMessage, endTestMessage, startTestMessage } from './protocol';
export const defaultTestOptions = Object.freeze({
    offset: 0,
    skip: false
});
// todo directive (todo & skip)
// todo plan
export const tester = (description, spec, { offset = 0, skip = false } = defaultTestOptions) => {
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
