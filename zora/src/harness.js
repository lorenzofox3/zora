import {Assert, createAssert} from './test.js';
import tapReporter from './tap-reporter.js';

export const createHarness = ({onlyMode = false} = {}) => {
    const tests = [];
    
    // WARNING if the "only" mode is passed to an harness, all the harnesses will be affected.
    // However, we do not expect multiple harnesses to be used in the same process
    if (onlyMode) {
        const {skip, test} = Assert;
        Assert.test = skip;
        Assert.only = test;
    }
    
    const {test, skip, only} = createAssert({
        onResult: (test) => tests.push(test)
    });
    
    // for convenience
    test.only = only;
    test.skip = skip;
    
    return {
        only,
        test,
        skip,
        report({reporter = tapReporter()} = {}) {
            return reporter(createMessageStream(tests));
        }
    };
};

async function* createMessageStream(tests) {
    for (const test of tests) {
        yield* test;
    }
}
