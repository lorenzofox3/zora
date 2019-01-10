import { TestResult } from './assertion';
import { Message } from './protocol';
/**
 * A Test is defined by test function collecting assertion results: it runs eagerly in its own micro task as soon as it is created.
 * However the result of the test routine can be awaited in the calling context (likely a parent test). This allows to fully manage the control flow within your tests.
 * The Test produces a stream of messages defined by the protocol in @link(./protocol.ts)
 * A Test is also a Result and may be used to emit an assertion result message in the parent context.
 */
export interface Test extends AsyncIterable<Message<any>>, TestResult {
    readonly routine: Promise<any>;
    readonly length: number;
    readonly fullLength: number;
}
export declare const defaultTestOptions: Readonly<{
    offset: number;
    skip: boolean;
}>;
export declare const tester: (description: any, spec: any, { offset, skip }?: Readonly<{
    offset: number;
    skip: boolean;
}>) => Test;
