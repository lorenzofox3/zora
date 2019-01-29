import { Assert } from './assertion';
import { Message } from './protocol';
import { Reporter } from './reporter';
import { TestGroup } from './test';
/**
 * A test harness create a root context for sub tests.
 * It produces a stream of messages defined by the protocol in @link(./protocol.ts).
 * When the report method is called, the messages stream is handed to a @link('./reporter.ts').
 * The default reporter is a tap reporter using the same conventions used by @link('https://github/substack/tape')
 */
export interface TestHarness extends Assert, AsyncIterable<Message<any>>, TestGroup {
    report: (reporter?: Reporter) => Promise<void>;
    pass: boolean;
}
export declare const harnessFactory: () => TestHarness;
