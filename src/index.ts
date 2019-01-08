import {defaultTestOptions, tester} from './test';
import {reporter as tap} from './tap-reporter';
import {SpecFunction, assert} from './assertion';
import {filter} from '@lorenzofox3/for-await';
import {assertionMessage, endTestMessage, MessageType, startTestMessage} from './protocol';

export * from './assertion';

let autoStart = true;

export interface TestHarness {
    test: (description: string, specFn: SpecFunction, options?: object) => void;
    run: () => Promise<void>;
}

async function* flatten(iterable) {
    for (const iter of iterable) {
        yield* iter;
    }
}

const harnessFactory = (reporter = tap): TestHarness => {
    const tests = [];
    let pass = true;
    let id = 0;
    const collect = item => tests.push(item);
    const api = assert(collect, 0);

    const instance = Object.create(api, {
        length: {
            get() {
                return tests.length;
            }
        }
    });

    return Object.assign(instance, {
        [Symbol.asyncIterator]: async function* () {
            for (const t of tests) {
                t.id = ++id;
                yield startTestMessage(t, 0);
                yield* t;
                yield assertionMessage(t, 0);
                pass = pass && t.pass;
            }
            yield endTestMessage(this, 0);
        },
        run: async () => {
            return reporter(instance);
        }
    });
};

const defaultTestHarness = harnessFactory();

export const test = defaultTestHarness.test;

export const createHarness = (reporter = tap) => {
    autoStart = false;
    return harnessFactory(reporter);
};

const start = () => {
    if (autoStart) {
        defaultTestHarness.run();
    }
};

// on next tick start reporting
// @ts-ignore
if (typeof window === 'undefined') {
    setTimeout(start, 0);
} else {
    // @ts-ignore
    window.addEventListener('load', start);
}
