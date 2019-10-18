import {assert} from './assertion';
import {Test} from './interfaces';
import {defaultTestOptions, noop, testerFactory} from './commons';

export const tester = (description, spec, {offset = 0, skip = false, runOnly = false} = defaultTestOptions): Test => {
    let executionTime = 0;
    let error = null;
    const assertions = [];
    const collect = item => assertions.push(item);
    const specFunction = skip === true ? noop : function zora_spec_fn() {
        return spec(assert(collect, offset, runOnly));
    };
    const testRoutine = (async function () {
        try {
            const start = Date.now();
            const result = await specFunction();
            executionTime = Date.now() - start;
            return result;
        } catch (e) {
            error = e;
        }
    })();

    return Object.defineProperties(testerFactory(assertions, testRoutine, offset), {
        error: {
            get() {
                return error;
            },
            set(val) {
                error = val;
            }
        },
        executionTime: {
            enumerable: true,
            get() {
                return executionTime;
            }
        },
        skip: {
            value: skip
        },
        description: {
            enumerable: true,
            value: description
        }
    });
};
