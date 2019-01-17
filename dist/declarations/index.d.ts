import { TestHarness } from './harness';
import { BooleanAssertionFunction, ComparatorAssertionFunction, ErrorAssertionFunction, MessageAssertionFunction, TestFunction } from './assertion';
interface RootTest extends TestFunction {
    indent: () => void;
}
export { tapeTapLike, mochaTapLike } from './reporter';
export { AssertPrototype, assert } from './assertion';
export declare const test: RootTest;
export declare const equal: ComparatorAssertionFunction;
export declare const equals: ComparatorAssertionFunction;
export declare const eq: ComparatorAssertionFunction;
export declare const deepEqual: ComparatorAssertionFunction;
export declare const notEqual: ComparatorAssertionFunction;
export declare const notEquals: ComparatorAssertionFunction;
export declare const notEq: ComparatorAssertionFunction;
export declare const notDeepEqual: ComparatorAssertionFunction;
export declare const is: ComparatorAssertionFunction;
export declare const same: ComparatorAssertionFunction;
export declare const isNot: ComparatorAssertionFunction;
export declare const notSame: ComparatorAssertionFunction;
export declare const ok: BooleanAssertionFunction;
export declare const truthy: BooleanAssertionFunction;
export declare const notOk: BooleanAssertionFunction;
export declare const falsy: BooleanAssertionFunction;
export declare const fail: MessageAssertionFunction;
export declare const throws: ErrorAssertionFunction;
export declare const doesNotThrow: ErrorAssertionFunction;
/**
 * If you create a test harness manually, report won't start automatically and you will
 * have to call the report method yourself. This can be handy if you wish to use another reporter
 * @returns {TestHarness}
 */
export declare const createHarness: () => TestHarness;
