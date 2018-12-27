import { TestResult } from './assertion';
import { Message } from './protocol';
export interface Test extends AsyncIterable<Message<any>>, TestResult {
    readonly routine: Promise<any>;
    readonly length: number;
}
export declare const defaultTestOptions: Readonly<{
    offset: number;
    skip: boolean;
}>;
export declare const tester: (description: any, spec: any, { offset, skip }?: Readonly<{
    offset: number;
    skip: boolean;
}>) => Test;
