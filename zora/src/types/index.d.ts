import { IReporter, Message } from '../../../reporters/src/types/index';
import { IAssert as GenericAssertionAPI } from '../../../assert/src/index';

export interface IReportOptions {
  reporter: IReporter;
}

export interface IHarnessOptions {
  onlyMode?: boolean;
}

export interface ITester {
  test: ITestFunction;
  skip: ITestFunction;
  only: ITestFunction;
}

export interface IAssert extends GenericAssertionAPI, ITester {}

export interface ISpecFunction {
  (assert: IAssert): any;
}

export interface ITestOptions {
  skip?: boolean;
}

export interface ITestFunction {
  (
    description: string,
    spec: ISpecFunction,
    opts?: ITestOptions
  ): Promise<any> & AsyncIterable<Message>;
}

export interface ITestHarness extends ITester {
  report(opts: IReportOptions): ReturnType<IReporter>;
}

export {
  createJSONReporter,
  createTAPReporter,
  ILogOptions,
} from '../../../reporters/src/types/index';

export let Assert: IAssert;
export declare function hold(): void;
export declare function report(opts: IReportOptions): ReturnType<IReporter>;
export declare function createHarness(opts: IHarnessOptions): ITestHarness;
export declare const test: ITestFunction;
export declare const only: ITestFunction;
export declare const skip: ITestFunction;
