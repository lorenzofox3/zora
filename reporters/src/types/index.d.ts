import { IAssertionResult } from '../../../assert/src/index';

interface INewTestMessageInput {
  description: string;
  skip: boolean;
}

interface ITestEndMessageInput {
  description: string;
  executionTime: number;
}

interface IMessage<T> {
  type: string;
  data: T;
}

interface INewTestMessage extends IMessage<INewTestMessageInput> {
  type: 'TEST_START';
}

interface IAssertionMessage extends IMessage<IAssertionResult<unknown>> {
  type: 'ASSERTION';
}

interface ITestEndMessage extends IMessage<ITestEndMessageInput> {
  type: 'TEST_END';
}

interface IErrorMessage extends IMessage<{ error: unknown }> {
  type: 'ERROR';
}

export type Message =
  | IAssertionMessage
  | IErrorMessage
  | ITestEndMessage
  | INewTestMessage;

export declare function newTestMessage(
  opts: INewTestMessageInput
): INewTestMessage;

export declare function assertionMessage(
  opts: IAssertionResult<unknown>
): IAssertionMessage;

export declare function testEndMessage(
  opts: INewTestMessageInput
): ITestEndMessage;

export declare function errorMessage(opts: { error: unknown }): IErrorMessage;

export interface IReporter {
  (messageStream: AsyncIterable<Message>): Promise<void>;
}

export interface ILogOptions {
  log?: (message: any) => void;
  serialize?: (value: any) => string;
}

export declare function createJSONReporter(opts?: ILogOptions): IReporter;

export declare function createTAPReporter(opts?: ILogOptions): IReporter;

export declare function createDiffReporter(): IReporter;
