import { harnessFactory } from './harness';
let autoStart = true;
const defaultTestHarness = harnessFactory();
export { tapeTapLike, mochaTapLike } from './reporter';
export const test = defaultTestHarness.test.bind(defaultTestHarness);
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
/**
 * If you create a test harness manually, report won't start automatically and you will
 * have to call the report method yourself. This can be handy if you wish to use another reporter
 * @returns {TestHarness}
 */
export const createHarness = () => {
    autoStart = false;
    return harnessFactory();
};
const start = () => {
    if (autoStart) {
        defaultTestHarness.report();
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
