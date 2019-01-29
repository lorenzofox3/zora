import {Assert, assert} from './assertion';
import {assertionMessage, endTestMessage, Message, startTestMessage} from './protocol';
import {Reporter, tapeTapLike as tap} from './reporter';
import {TestGroup, Test} from './test';

/**
 * A test harness create a root context for sub tests.
 * It produces a stream of messages defined by the protocol in @link(./protocol.ts).
 * When the report method is called, the messages stream is handed to a @link('./reporter.ts').
 * The default reporter is a tap reporter using the same conventions used by @link('https://github/substack/tape')
 */
export interface TestHarness extends Assert, AsyncIterable<Message<any>>, TestGroup {
    report: (reporter?: Reporter) => Promise<void>;
    pass: boolean;
}

export const harnessFactory = (): TestHarness => {
    const tests: Test[] = [];
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
                    yield startTestMessage({description: t.description}, rootOffset);
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
        report: async (reporter = tap) => {
            return reporter(instance);
        }
    });
};
