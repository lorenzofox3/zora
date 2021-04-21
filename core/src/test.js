import assertFactory, {Assert} from 'zora-assert';
import {assertionMessage, bailOutMessage, newTestMessage, testEndMessage} from './protocol.js';

const defaultOptions = Object.freeze({skip: false});
const noop = () => {
};

const isTest = (assertionLike) => assertionLike[Symbol.asyncIterator] !== void 0;

Assert.test = (description, spec, opts = defaultOptions) => test(description, spec, opts);

Assert.skip = (description, spec, opts = defaultOptions) => test(description, spec, {...opts, skip: true});

export const test = (description, spec, opts = defaultOptions) => {
    const {skip = false} = opts;
    const assertions = [];
    let executionTime;
    let done = false;
    let error;
    
    const onResult = (assertion) => {
        if (done) {
            throw new Error(`test "${description}"
tried to collect an assertion after it has run to its completion.
You might have forgotten to wait for an asynchronous task to complete
------
${spec.toString()}`);
        }
        
        assertions.push(assertion);
    };
    
    const specFn = skip ? noop : function zora_spec_fn() {
        return spec(assertFactory({onResult}));
    };
    
    const testRoutine = (async function () {
        try {
            const start = Date.now();
            const result = await specFn();
            executionTime = Date.now() - start;
            return result;
        } catch (e) {
            error = e;
        } finally {
            done = true;
        }
    })();
    
    return Object.assign(testRoutine, {
        [Symbol.asyncIterator]: async function* () {
            yield newTestMessage({description});
            await testRoutine;
            for (const assertion of assertions) {
                if (isTest(assertion)) {
                    yield* assertion;
                } else {
                    yield assertionMessage(assertion);
                }
            }
            
            if (error) {
                return yield bailOutMessage({error});
            }
            
            yield testEndMessage({description, executionTime});
        }
    });
};

export const createAssert = assertFactory;
