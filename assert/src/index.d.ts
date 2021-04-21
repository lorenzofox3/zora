export interface IAssertionResult<T> {
    pass: boolean;
    actual: unknown;
    expected: T;
    description: string;
    operator: string;
    at?: string;
}

export interface ComparatorAssertionFunction {
    <T>(actual: unknown, expected: T, description?: string): IAssertionResult<T>;
}

export interface BooleanAssertionFunction {
    (actual: unknown, description?: string): IAssertionResult<boolean>;
}

export interface ErrorAssertionFunction {
    (fn: Function, expected?: string | RegExp | Function, description ?: string): IAssertionResult<string | RegExp | Function>;
}

export interface MessageAssertionFunction {
    (message?: string): IAssertionResult<string>;
}

interface IAssert {
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
}

declare function factory(options?: IAssertOptions): IAssert;

export const Assert: IAssert;

export interface IAssertOptions {
    onResult: (result: IAssertionResult<unknown>) => void;
}

export default factory;
