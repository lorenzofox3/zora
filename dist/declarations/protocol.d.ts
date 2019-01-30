import { AssertionResult, Test } from './interfaces';
export declare const startTestMessage: (test: {
    description: any;
}, offset: number) => import("./interfaces").Message<{
    description: string;
}>;
export declare const assertionMessage: (assertion: AssertionResult | Test, offset: number) => import("./interfaces").Message<AssertionResult | Test>;
export declare const endTestMessage: (test: Test, offset: number) => import("./interfaces").Message<Test>;
export declare const bailout: (error: Error, offset: number) => import("./interfaces").Message<Error>;
