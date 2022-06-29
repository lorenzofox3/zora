export interface IAssertionResult<T> {
  pass: boolean;
  actual: unknown;
  expected: T;
  description: string;
  operator: string;
  at?: string;
}

export interface ComparatorAssertionFunction {
  <T>(actual: unknown, expected: T, description?: string): IAssertionResult<T>;
}

export interface BooleanAssertionFunction {
  (actual: unknown, description?: string): IAssertionResult<boolean>;
}

export type ErrorAssertionFunction = {
  (
    fn: Function,
    expected: RegExp | Function,
    description?: string
  ): IAssertionResult<string | Function>;
  (fn: Function, description?: string): IAssertionResult<string>;
};

export type RejectsErrorAssertionFunction = {
  (
    fn: Promise<any> | (() => Promise<any>),
    expected: RegExp | Function,
    description?: string
  ): Promise<IAssertionResult<string | Function>>;
  (fn: Promise<any> | (() => Promise<any>), description?: string): Promise<IAssertionResult<string>>;
};

export interface MessageAssertionFunction {
  (message?: string): IAssertionResult<string>;
}

export interface IAssert {
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

  rejects: RejectsErrorAssertionFunction;
}

declare function factory(options?: IAssertOptions): IAssert;

export declare const Assert: IAssert;

export interface IAssertOptions {
  onResult: (result: IAssertionResult<unknown>) => void;
}

export default factory;
