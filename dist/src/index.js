import { reporter as tap } from './tap-reporter';
import { assert } from './assertion';
import { assertionMessage, endTestMessage, startTestMessage } from './protocol';
export * from './assertion';
let autoStart = true;
async function* flatten(iterable) {
    for (const iter of iterable) {
        yield* iter;
    }
}
const harnessFactory = (reporter = tap) => {
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
}
else {
    // @ts-ignore
    window.addEventListener('load', start);
}
