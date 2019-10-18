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
    skip?: boolean;
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

export interface SpecFunction {
    (t: Assert): any
}

export interface ComparatorAssertionFunction {
    <T>(actual: T, expected: T, description?: string): AssertionResult;
}

export interface BooleanAssertionFunction {
    <T>(actual: T, description?: string): AssertionResult;
}

export interface ErrorAssertionFunction {
    (fn: Function, expected?: string | RegExp | Function, description ?: string): AssertionResult;
}

export interface MessageAssertionFunction {
    (message?: string): AssertionResult;
}

export interface TestFunction {
    (description: string, spec: SpecFunction, options?: object): Promise<TestResult>;
}

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

    only: TestFunction;
}

export type AssertionFunction =
    ComparatorAssertionFunction
    | BooleanAssertionFunction
    | ErrorAssertionFunction
    | MessageAssertionFunction;

export interface Counter {
    successCount: number;
    failureCount: number;
    skipCount: number;
    count: number;
}

export interface Test extends AsyncIterable<Message<any>>, TestResult, Counter {
    readonly routine: Promise<any>;
    readonly length: number;
    readonly error?: any;
}

export interface TestCounter extends Counter {
    update(assertion: Test | AssertionResult): void;
}

export interface TestHarnessConfiguration {
    runOnly?: boolean;
    indent?: boolean;
}

export interface TestHarness extends Assert, AsyncIterable<Message<any>>, Counter {
    report: (reporter?: Reporter) => Promise<void>;
    pass: boolean;
}

export interface RootTest extends TestFunction {
    indent: () => void;
    skip: TestFunction;
}

export const enum MessageType {
    TEST_START = 'TEST_START',
    ASSERTION = 'ASSERTION',
    TEST_END = 'TEST_END',
    BAIL_OUT = 'BAIL_OUT'
}

export interface Message<T> {
    offset: number;
    type: MessageType,
    data: T
}

export interface Reporter {
    (stream: AsyncIterable<Message<any>>): Promise<void>;
}

export type StartTestMessage = Message<{ description: string }>

export type AssertionMessage = Message<Test | AssertionResult>;

export type TestEndMessage = Message<Test>

export type BailoutMessage = Message<Error>;