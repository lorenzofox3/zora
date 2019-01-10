import {AssertionResult, TestResult} from './assertion';
import {Test} from './test';

/**
 * A test harness will produce a stream of messages.
 * Each message is a defined by the protocol below
 */

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

export type StartTestMessage = Message<{ description: string }>

/**
 * Emitted when a new sub test has started
 * @param {{description}} test - A Test
 * @param {number} offset - give the nested level
 * @returns {StartTestMessage}
 */
export const startTestMessage = (test: { description }, offset: number): StartTestMessage => ({
    type: MessageType.TEST_START,
    data: test,
    offset
});

export type AssertionMessage = Message<TestResult | AssertionResult>;

/**
 * Emitted when an assertion result is produced. Note than when a sub test finishes, it also emits an assertion result in the parent sub test stream
 * @param {TestResult | AssertionResult} assertion
 * @param {number} offset - give the nested level
 * @returns {AssertionMessage}
 */
export const assertionMessage = (assertion: TestResult | AssertionResult, offset: number): AssertionMessage => ({
    type: MessageType.ASSERTION,
    data: assertion,
    offset
});

export type TestEndMessage = Message<Test>
/**
 * Emitted when a sub tests finishes
 * @param {Test} test - The Sub test
 * @param {number} offset - the nested level
 * @returns {TestEndMessage}
 */
export const endTestMessage = (test: Test, offset: number): TestEndMessage => ({
    type: MessageType.TEST_END,
    data: test,
    offset
});

export type BailoutMessage = Message<Error>;
/**
 * Emitted when an error is not handled
 * @param {Error} error
 * @param {number} offset
 * @returns {BailoutMessage}
 */
export const bailout = (error: Error, offset: number): BailoutMessage => ({
    type:MessageType.BAIL_OUT,
    data: error,
    offset
});
