import {createHarness as privateHarnessFactory} from './harness.js';
import {findConfigurationValue} from './env.js';
import {createJSONReporter, createTAPReporter} from 'zora-reporters';

let autoStart = true;

const harness = privateHarnessFactory({onlyMode: findConfigurationValue('ZORA_ONLY') !== void 0});

export {Assert} from './test.js';

export const only = harness.only;

export const test = harness.test;

export const skip = harness.skip;

export const report = harness.report;

export const createHarness = (opts) => {
    autoStart = false;
    return privateHarnessFactory(opts);
};

const start = async () => {
    if (autoStart) {
        const reporter = findConfigurationValue('ZORA_REPORTER') === 'json' ? createJSONReporter() : createTAPReporter();
        await report({reporter});
    }
};

// on next tick start reporting
if (typeof window === 'undefined') {
    setTimeout(start, 0);
} else {
    window.addEventListener('load', start);
}
