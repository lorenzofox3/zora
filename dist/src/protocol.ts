import {AssertionResult, TestResult} from './assertion';
import {Test} from './test';

export const enum MessageType {
    TEST_START = 'TEST_START',
    ASSERTION = 'ASSERTION',
    TEST_END = 'TEST_END',
    COMMENT = 'COMMENT'
}

export interface Message<T> {
    offset: number;
    type: MessageType,
    data: T
}

export type StartTestMessage = Message<{ description: string }>
export const startTestMessage = (test: { description }, offset: number): StartTestMessage => ({
    type: MessageType.TEST_START,
    data: test,
    offset
});

export type AssertionMessage = Message<TestResult | AssertionResult>;
export const assertionMessage = (assertion: TestResult | AssertionResult, offset: number): AssertionMessage => ({
    type: MessageType.ASSERTION,
    data: assertion,
    offset
});

export type TestEndMessage = Message<Test>
export const endTestMessage = (test: Test, offset: number): TestEndMessage => ({
    type: MessageType.TEST_END,
    data: test,
    offset
});

export type CommentMessage = Message<string>;
export const comment = (comment: string, offset: number): CommentMessage => ({
    type: MessageType.COMMENT,
    data: comment,
    offset
});
