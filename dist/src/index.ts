import {defaultTestOptions, tester} from './test';
import {reporter as tap} from './tap-reporter';
import {SpecFunction} from './assertion';
import {filter} from '@lorenzofox3/for-await';
import {MessageType} from './protocol';

export * from './assertion';

let autoStart = true;

//todo export harness interface;
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
    const test = (description, specFn, opts = defaultTestOptions) => {
        tests.push(tester(description, specFn, opts));
    };

    return {
        test,
        run: async () => {
            //todo print plan
            return reporter(filter((message) => message.type !== MessageType.TEST_END || message.offset > 0, flatten(tests)));
        }
    };
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
