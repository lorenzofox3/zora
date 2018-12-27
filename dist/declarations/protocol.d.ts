import { AssertionResult, TestResult } from './assertion';
import { Test } from './test';
export declare const enum MessageType {
    TEST_START = "TEST_START",
    ASSERTION = "ASSERTION",
    TEST_END = "TEST_END",
    COMMENT = "COMMENT"
}
export interface Message<T> {
    offset: number;
    type: MessageType;
    data: T;
}
export declare type StartTestMessage = Message<{
    description: string;
}>;
export declare const startTestMessage: (test: {
    description: any;
}, offset: number) => Message<{
    description: string;
}>;
export declare type AssertionMessage = Message<TestResult | AssertionResult>;
export declare const assertionMessage: (assertion: TestResult | AssertionResult, offset: number) => Message<TestResult | AssertionResult>;
export declare type TestEndMessage = Message<Test>;
export declare const endTestMessage: (test: Test, offset: number) => Message<Test>;
export declare type CommentMessage = Message<string>;
export declare const comment: (comment: string, offset: number) => Message<string>;
