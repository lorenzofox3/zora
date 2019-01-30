import {harnessFactory} from './harness';
import {mochaTapLike, tapeTapLike} from './reporter';
import {
    RootTest,
    TestFunction,
    SpecFunction,
    ComparatorAssertionFunction,
    BooleanAssertionFunction,
    MessageAssertionFunction,
    ErrorAssertionFunction,
    TestHarness
} from './interfaces';

let autoStart = true;
let indent = false;
const defaultTestHarness = harnessFactory();

const rootTest = defaultTestHarness.test.bind(defaultTestHarness);
rootTest.indent = () => indent = true;

export {tapeTapLike, mochaTapLike} from './reporter';
export {AssertPrototype} from './assertion';
export const test: RootTest = rootTest;
export const skip: TestFunction = (description: string, spec: SpecFunction, options = {}) => rootTest(description, spec, Object.assign({}, options, {skip: true}));
rootTest.skip = skip;
export const equal: ComparatorAssertionFunction = defaultTestHarness.equal.bind(defaultTestHarness);
export const equals = equal;
export const eq = equal;
export const deepEqual = equal;

export const notEqual: ComparatorAssertionFunction = defaultTestHarness.notEqual.bind(defaultTestHarness);
export const notEquals = notEqual;
export const notEq = notEqual;
export const notDeepEqual = notEqual;

export const is: ComparatorAssertionFunction = defaultTestHarness.is.bind(defaultTestHarness);
export const same = is;

export const isNot: ComparatorAssertionFunction = defaultTestHarness.isNot.bind(defaultTestHarness);
export const notSame = isNot;

export const ok: BooleanAssertionFunction = defaultTestHarness.ok.bind(defaultTestHarness);
export const truthy = ok;

export const notOk: BooleanAssertionFunction = defaultTestHarness.notOk.bind(defaultTestHarness);
export const falsy = notOk;

export const fail: MessageAssertionFunction = defaultTestHarness.fail.bind(defaultTestHarness);

export const throws: ErrorAssertionFunction = defaultTestHarness.throws.bind(defaultTestHarness);
export const doesNotThrow: ErrorAssertionFunction = defaultTestHarness.doesNotThrow.bind(defaultTestHarness);

export const createHarness = (): TestHarness => {
    autoStart = false;
    return harnessFactory();
};

const start = () => {
    if (autoStart) {
        defaultTestHarness.report(indent ? mochaTapLike : tapeTapLike);
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
