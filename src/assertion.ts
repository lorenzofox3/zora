import {defaultTestOptions, tester} from './test';

// todo
// import * as equal from 'fast-deep-equal';

export const enum Operator {
    EQUAL = 'equal',
    NOT_EQUAL = 'notEqual',
    IS = 'is',
    OK = 'ok',
    NOT_OK = 'notOk',
    IS_NOT = 'isNot',
    FAIL = 'fail',
    THROWS = 'throws',
    DOES_NOT_THROW = 'doesNotThrow'
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

export const isAssertionResult = (result: TestResult | AssertionResult): result is AssertionResult => {
    return 'operator' in result;
};

export interface SpecFunction {
    (t: Assert): any
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

    throws(fn: Function, expected?: string | RegExp | Function, description ?: string): AssertionResult;

    doesNotThrow(fn: Function, expected?: string | RegExp | Function, description ?: string): AssertionResult;

    test(description: string, spec: SpecFunction): Promise<TestResult>;
}

const getAssertionLocation = (): string => {
    const err = new Error();
    const stack = (err.stack || '').split('\n');
    return (stack[3] || '').trim().replace(/^at/i, '');
};

interface AssertionFunction {
    (actual: any, description?: string): AssertionResult;

    (actual: any, expected: any, description?: string): AssertionResult;
}

const assertMethodHook = (fn: AssertionFunction): AssertionFunction => function (actual, ...rest) {
    const assertResult = fn(actual, ...rest);

    if (assertResult.pass === false) {
        assertResult.at = getAssertionLocation();
    }

    this.collect(assertResult);

    return assertResult;
};

const aliasMethodHook = (methodName: string) => function (...args) {
    return this[methodName](...args);
};

export const AssertPrototype = {
    equal: assertMethodHook((actual, expected, description = 'should be equivalent') => ({
        pass: Object.is(actual, expected), //todo
        actual,
        expected,
        description,
        operator: Operator.EQUAL
    })),
    equals: aliasMethodHook('equal'),
    eq: aliasMethodHook('equal'),
    deepEqual: aliasMethodHook('equal'),
    notEqual: assertMethodHook((actual, expected, description = 'should not be equivalent') => ({
        pass: Object.is(actual, expected), //todo
        actual,
        expected,
        description,
        operator: Operator.NOT_EQUAL
    })),
    notEquals: aliasMethodHook('notEqual'),
    notEq: aliasMethodHook('notEqual'),
    notDeepEqual: aliasMethodHook('notEqual'),
    is: assertMethodHook((actual, expected, description = 'should be the same value') => ({
        pass: Object.is(actual, expected),
        actual,
        expected,
        description,
        operator: Operator.IS
    })),
    same: aliasMethodHook('is'),
    isNot: assertMethodHook((actual, expected, description = 'should not be the same value') => ({
        pass: !Object.is(actual, expected),
        actual,
        expected,
        description,
        operator: Operator.IS_NOT
    })),
    notSame: aliasMethodHook('isNot'),
    ok: assertMethodHook((actual, description = 'should be the truthy') => ({
        pass: Boolean(actual),
        actual,
        expected: true,
        description,
        operator: Operator.OK
    })),
    truthy: aliasMethodHook('ok'),
    notOk: assertMethodHook((actual, description = 'should be the falsy') => ({
        pass: !Boolean(actual),
        actual,
        expected: true,
        description,
        operator: Operator.NOT_OK
    })),
    falsy: aliasMethodHook('notOk'),
    fail: assertMethodHook((description = 'fail called') => ({
        pass: false,
        actual: 'fail called',
        expected: 'fail not called',
        description,
        operator: Operator.FAIL
    })),
    throws: assertMethodHook((func: Function, expected, description?: string) => {
        let caught;
        let pass: boolean;
        let actual;
        if (typeof expected === 'string') {
            [expected, description] = [description, expected];
        }
        try {
            func();
        } catch (err) {
            caught = {error: err};
        }
        pass = caught !== undefined;
        actual = caught && caught.error;
        if (expected instanceof RegExp) {
            pass = expected.test(actual) || expected.test(actual && actual.message);
            actual = actual && actual.message || actual;
            expected = String(expected);
        } else if (typeof expected === 'function' && caught) {
            pass = actual instanceof expected;
            actual = actual.constructor;
        }
        return {
            pass,
            actual,
            expected,
            description: description || 'should throw',
            operator: Operator.THROWS,
        };
    }),
    doesNotThrow: assertMethodHook((func, expected, description?: string) => {
        let caught;
        if (typeof expected === 'string') {
            [expected, description] = [description, expected];
        }
        try {
            func();
        } catch (err) {
            caught = {error: err};
        }
        return {
            pass: caught === undefined,
            expected: 'no thrown error',
            actual: caught && caught.error,
            operator: Operator.DOES_NOT_THROW,
            description: description || 'should not throw'
        };
    })
};

export const assert = (collect, offset: number): Assert => {
    return Object.assign(
        Object.create(AssertPrototype, {collect: {value: collect}}),
        {
            test(description, spec, opts = defaultTestOptions) {
                const subTest = tester(description, spec, Object.assign({}, defaultTestOptions, opts, {offset: offset + 1}));
                collect(subTest);
                return subTest.routine;
            }
        }
    );
};
