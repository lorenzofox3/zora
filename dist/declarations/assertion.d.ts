import { Test } from './test';
export declare const enum Operator {
    EQUAL = "equal",
    NOT_EQUAL = "notEqual",
    IS = "is",
    OK = "ok",
    NOT_OK = "notOk",
    IS_NOT = "isNot",
    FAIL = "fail",
    THROWS = "throws",
    DOES_NOT_THROW = "doesNotThrow"
}
export interface Result {
    pass: boolean;
    description: string;
    id?: number;
    skip?: boolean;
}
export interface TestResult extends Result {
    executionTime: number;
}
/**
 * An assertion result contains the information related to a given expectation
 */
export interface AssertionResult extends Result {
    operator: Operator;
    expected: any;
    actual: any;
    at?: string;
}
export declare const isAssertionResult: (result: Test | AssertionResult) => result is AssertionResult;
export interface SpecFunction {
    (t: Assert): any;
}
export interface ComparatorAssertionFunction {
    <T>(actual: T, expected: T, description?: string): AssertionResult;
}
export interface BooleanAssertionFunction {
    <T>(actual: T, description?: string): AssertionResult;
}
export interface ErrorAssertionFunction {
    (fn: Function, expected?: string | RegExp | Function, description?: string): AssertionResult;
}
export interface MessageAssertionFunction {
    (message?: string): AssertionResult;
}
export interface TestFunction {
    (description: string, spec: SpecFunction, options?: object): Promise<TestResult>;
}
declare type AssertionFunction = ComparatorAssertionFunction | BooleanAssertionFunction | ErrorAssertionFunction | MessageAssertionFunction;
/**
 * The Assert object provide a set of expectation method producing AssertionResult.
 * Note these AssertionResults are collected by the calling Test.
 * An Assert object can also create sub test.
 */
export interface Assert {
    equal: ComparatorAssertionFunction;
    equals: ComparatorAssertionFunction;
    eq: ComparatorAssertionFunction;
    deepEqual: ComparatorAssertionFunction;
    notEqual: ComparatorAssertionFunction;
    notEquals: ComparatorAssertionFunction;
    notEq: ComparatorAssertionFunction;
    notDeepEqual: ComparatorAssertionFunction;
    is: ComparatorAssertionFunction;
    same: ComparatorAssertionFunction;
    isNot: ComparatorAssertionFunction;
    notSame: ComparatorAssertionFunction;
    ok: BooleanAssertionFunction;
    truthy: BooleanAssertionFunction;
    notOk: BooleanAssertionFunction;
    falsy: BooleanAssertionFunction;
    fail: MessageAssertionFunction;
    throws: ErrorAssertionFunction;
    doesNotThrow: ErrorAssertionFunction;
    test: TestFunction;
    skip: TestFunction;
}
export declare const AssertPrototype: {
    equal: AssertionFunction;
    equals: (...args: any[]) => any;
    eq: (...args: any[]) => any;
    deepEqual: (...args: any[]) => any;
    notEqual: AssertionFunction;
    notEquals: (...args: any[]) => any;
    notEq: (...args: any[]) => any;
    notDeepEqual: (...args: any[]) => any;
    is: AssertionFunction;
    same: (...args: any[]) => any;
    isNot: AssertionFunction;
    notSame: (...args: any[]) => any;
    ok: AssertionFunction;
    truthy: (...args: any[]) => any;
    notOk: AssertionFunction;
    falsy: (...args: any[]) => any;
    fail: AssertionFunction;
    throws: AssertionFunction;
    doesNotThrow: AssertionFunction;
};
export declare const assert: (collect: any, offset: number) => Assert;
export {};
