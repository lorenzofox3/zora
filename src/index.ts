import {harnessFactory} from './harness';
import {mochaTapLike, tapeTapLike} from './reporter';
import {
    BooleanAssertionFunction,
    ComparatorAssertionFunction,
    ErrorAssertionFunction,
    MessageAssertionFunction,
    RootTest,
    TestFunction,
    TestHarness
} from './interfaces';

const findConfigurationFlag = (name) => {
    if (typeof process !== 'undefined') {
        return process.env[name] === 'true';
        // @ts-ignore
    } else if (typeof window !== 'undefined') {
        // @ts-ignore
        return Boolean(window[name]);
    }
    return false;
};

const defaultTestHarness = harnessFactory({
    runOnly: findConfigurationFlag('RUN_ONLY')
});

let autoStart = true;
let indent = findConfigurationFlag('INDENT');

const rootTest = defaultTestHarness.test.bind(defaultTestHarness);
rootTest.indent = () => {
    console.warn('indent function is deprecated, use "INDENT" configuration flag instead');
    indent = true;
};

export * from './interfaces';

export {tapeTapLike, mochaTapLike} from './reporter';
export {AssertPrototype} from './assertion';
export const test: RootTest = rootTest;
export const skip: TestFunction = defaultTestHarness.skip.bind(defaultTestHarness);
export const only: TestFunction = defaultTestHarness.only.bind(defaultTestHarness);
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

export const createHarness = (opts = {}): TestHarness => {
    autoStart = false;
    return harnessFactory(opts);
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
