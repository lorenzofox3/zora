import {IAssertionResult} from 'zora-assert';

export interface INewTestMessageInput {
    description: string;
    skip: boolean;
}

export interface ITestEndMessageInput {
    description: string;
    executionTime: number;
}

export interface IMessage<T> {
    type: string;
    data: T
}

export interface INewTestMessage extends IMessage<INewTestMessageInput> {
    type: 'TEST_START'
}

export interface IAssertionMessage extends IMessage<IAssertionResult<unknown>> {
    type: 'ASSERTION'
}

export interface ITestEndMessage extends IMessage<ITestEndMessageInput> {
    type: 'TEST_END'
}

export interface IBailOutMessage extends IMessage<{ error: unknown }> {
    type: 'BAIL_OUT'
}

export declare function newTestMessage(opts: INewTestMessageInput): INewTestMessage;

export declare function assertionMessage(opts: IAssertionResult<unknown>): IAssertionMessage;

export declare function testEndMessage(opts: INewTestMessageInput): ITestEndMessage;

export declare function bailoutMessage(opts: { error: unknown }): IBailOutMessage;
