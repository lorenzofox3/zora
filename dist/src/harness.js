import { assert } from './assertion';
import { assertionMessage, endTestMessage, startTestMessage } from './protocol';
import { tapeTapLike as tap } from './reporter';
export const harnessFactory = () => {
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
        fullLength: {
            get() {
                return tests.reduce((acc, curr) => acc + (curr.fullLength !== void 0 ? curr.fullLength : 1), 0);
            }
        },
        pass: {
            get() {
                return pass;
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
                    if (t.error !== null) {
                        pass = false;
                        return;
                    }
                }
                yield assertionMessage(t, rootOffset);
                pass = pass && t.pass;
            }
            yield endTestMessage(instance, rootOffset);
        },
        report: async (reporter = tap) => {
            return reporter(instance);
        }
    });
};
