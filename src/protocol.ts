import {
    AssertionMessage,
    AssertionResult,
    BailoutMessage,
    MessageType,
    StartTestMessage,
    Test,
    TestEndMessage
} from './interfaces';

export const startTestMessage = (test: { description }, offset: number): StartTestMessage => ({
    type: MessageType.TEST_START,
    data: test,
    offset
});

export const assertionMessage = (assertion: Test | AssertionResult, offset: number): AssertionMessage => ({
    type: MessageType.ASSERTION,
    data: assertion,
    offset
});

export const endTestMessage = (test: Test, offset: number): TestEndMessage => ({
    type: MessageType.TEST_END,
    data: test,
    offset
});

export const bailout = (error: Error, offset: number): BailoutMessage => ({
    type: MessageType.BAIL_OUT,
    data: error,
    offset
});
