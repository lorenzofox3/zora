import {Assert, assert, SpecFunction} from './assertion';
import {assertionMessage, endTestMessage, startTestMessage} from './protocol';
import {Reporter, tapeTapLike as tap} from './reporter';

/**
 * A test harness create a root context for sub tests.
 * It produces a stream of messages defined by the protocol in @link(./protocol.ts).
 * When the report method is called, the messages stream is handed to a @link('./reporter.ts').
 * The default reporter is a tap reporter using the same conventions used by @link('https://github/substack/tape')
 */
export interface TestHarness extends Assert {
    report: (reporter?: Reporter) => Promise<void>;
}

export const harnessFactory = (): TestHarness => {
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
                    yield startTestMessage({description: t.description}, rootOffset);
                    yield* t;
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
