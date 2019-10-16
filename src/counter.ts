import {isAssertionResult} from './assertion';
import {AssertionResult, Counter, Test, TestCounter} from './interfaces';

export const delegateToCounter = (counter: Counter) => <T>(target: T): T & Counter => Object.defineProperties(target, {
    skipCount: {
        get() {
            return counter.skipCount;
        }
    },
    failureCount: {
        get() {
            return counter.failureCount;
        }
    },
    successCount: {
        get() {
            return counter.successCount;
        }
    },
    count: {
        get() {
            return counter.count;
        }
    }
});

export const counter = (): TestCounter => {
    let success = 0;
    let failure = 0;
    let skip = 0;
    return Object.defineProperties({
        update(assertion: Test | AssertionResult) {
            const {pass, skip: isSkipped} = assertion;
            if (isSkipped) {
                skip++;
            } else if (!isAssertionResult(assertion)) {
                skip += assertion.skipCount;
                success += assertion.successCount;
                failure += assertion.failureCount;
            } else if (pass) {
                success++;
            } else {
                failure++;
            }
        }
    }, {
        successCount: {
            get() {
                return success;
            }
        },
        failureCount: {
            get() {
                return failure;
            }
        },
        skipCount: {
            get() {
                return skip;
            }
        },
        count: {
            get() {
                return skip + success + failure;
            }
        }
    });
};
