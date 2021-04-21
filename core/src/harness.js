import {createAssert} from './test.js';
import {tapReporter} from './tap-reporter.js';

export const createHarness = (name, {reporter = tapReporter()} = {}) => {
    const tests = [];
    const {test, skip} = createAssert({
        onResult: (test) => tests.push(test)
    });
    
    return {
        test,
        skip,
        report() {
            return reporter(createMessageStream());
        }
    };
    
    async function* createMessageStream() {
        for (const test of tests) {
            yield* test;
        }
    }
};
