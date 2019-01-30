import { harnessFactory } from './harness';
import { mochaTapLike, tapeTapLike } from './reporter';
let autoStart = true;
let indent = false;
const defaultTestHarness = harnessFactory();
const rootTest = defaultTestHarness.test.bind(defaultTestHarness);
rootTest.indent = () => indent = true;
export { tapeTapLike, mochaTapLike } from './reporter';
export { AssertPrototype } from './assertion';
export const test = rootTest;
export const skip = (description, spec, options = {}) => rootTest(description, spec, Object.assign({}, options, { skip: true }));
rootTest.skip = skip;
export const equal = defaultTestHarness.equal.bind(defaultTestHarness);
export const equals = equal;
export const eq = equal;
export const deepEqual = equal;
export const notEqual = defaultTestHarness.notEqual.bind(defaultTestHarness);
export const notEquals = notEqual;
export const notEq = notEqual;
export const notDeepEqual = notEqual;
export const is = defaultTestHarness.is.bind(defaultTestHarness);
export const same = is;
export const isNot = defaultTestHarness.isNot.bind(defaultTestHarness);
export const notSame = isNot;
export const ok = defaultTestHarness.ok.bind(defaultTestHarness);
export const truthy = ok;
export const notOk = defaultTestHarness.notOk.bind(defaultTestHarness);
export const falsy = notOk;
export const fail = defaultTestHarness.fail.bind(defaultTestHarness);
export const throws = defaultTestHarness.throws.bind(defaultTestHarness);
export const doesNotThrow = defaultTestHarness.doesNotThrow.bind(defaultTestHarness);
export const createHarness = () => {
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
}
else {
    // @ts-ignore
    window.addEventListener('load', start);
}
