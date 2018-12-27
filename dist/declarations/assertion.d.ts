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
}
export interface TestResult extends Result {
    executionTime: number;
}
export interface AssertionResult extends Result {
    operator: Operator;
    expected: any;
    actual: any;
    at?: string;
}
export declare const isAssertionResult: (result: TestResult | AssertionResult) => result is AssertionResult;
export interface SpecFunction {
    (t: Assert): any;
}
export interface Assert {
    equal<T>(actual: T, expected: T, description?: string): AssertionResult;
    equals<T>(actual: T, expected: T, description?: string): AssertionResult;
    eq<T>(actual: T, expected: T, description?: string): AssertionResult;
    deepEqual<T>(actual: T, expected: T, description?: string): AssertionResult;
    notEqual<T>(actual: T, expected: T, description?: string): AssertionResult;
    notEquals<T>(actual: T, expected: T, description?: string): AssertionResult;
    notEq<T>(actual: T, expected: T, description?: string): AssertionResult;
    notDeepEqual<T>(actual: T, expected: T, description?: string): AssertionResult;
    is<T>(actual: T, expected: T, description?: string): AssertionResult;
    same<T>(actual: T, expected: T, description?: string): AssertionResult;
    isNot<T>(actual: T, expected: T, description?: string): AssertionResult;
    notSame<T>(actual: T, expected: T, description?: string): AssertionResult;
    ok<T>(actual: T, description?: string): AssertionResult;
    truthy<T>(actual: T, description?: string): AssertionResult;
    notOk<T>(actual: T, description?: string): AssertionResult;
    falsy<T>(actual: T, description?: string): AssertionResult;
    fail(message?: string): AssertionResult;
    throws(fn: Function, expected?: string | RegExp | Function, description?: string): AssertionResult;
    doesNotThrow(fn: Function, expected?: string | RegExp | Function, description?: string): AssertionResult;
    test(description: string, spec: SpecFunction): Promise<TestResult>;
}
interface AssertionFunction {
    (actual: any, description?: string): AssertionResult;
    (actual: any, expected: any, description?: string): AssertionResult;
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
