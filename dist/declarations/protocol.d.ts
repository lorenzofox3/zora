import { AssertionResult } from './assertion';
import { Test } from './test';
/**
 * A test harness will produce a stream of messages.
 * Each message is a defined by the protocol below
 */
export declare const enum MessageType {
    TEST_START = "TEST_START",
    ASSERTION = "ASSERTION",
    TEST_END = "TEST_END",
    BAIL_OUT = "BAIL_OUT"
}
export interface Message<T> {
    offset: number;
    type: MessageType;
    data: T;
}
export declare type StartTestMessage = Message<{
    description: string;
}>;
/**
 * Emitted when a new sub test has started
 * @param {{description}} test - A Test
 * @param {number} offset - give the nested level
 * @returns {StartTestMessage}
 */
export declare const startTestMessage: (test: {
    description: any;
}, offset: number) => Message<{
    description: string;
}>;
export declare type AssertionMessage = Message<Test | AssertionResult>;
/**
 * Emitted when an assertion result is produced. Note than when a sub test finishes, it also emits an assertion result in the parent sub test stream
 * @param {TestResult | AssertionResult} assertion
 * @param {number} offset - give the nested level
 * @returns {AssertionMessage}
 */
export declare const assertionMessage: (assertion: Test | AssertionResult, offset: number) => Message<Test | AssertionResult>;
export declare type TestEndMessage = Message<Test>;
/**
 * Emitted when a sub tests finishes
 * @param {Test} test - The Sub test
 * @param {number} offset - the nested level
 * @returns {TestEndMessage}
 */
export declare const endTestMessage: (test: Test, offset: number) => Message<Test>;
export declare type BailoutMessage = Message<Error>;
/**
 * Emitted when an error is not handled
 * @param {Error} error
 * @param {number} offset
 * @returns {BailoutMessage}
 */
export declare const bailout: (error: Error, offset: number) => Message<Error>;
