import { Assert } from './assertion';
import { Reporter } from './reporter';
/**
 * A test harness create a root context for sub tests.
 * It produces a stream of messages defined by the protocol in @link(./protocol.ts).
 * When the report method is called, the messages stream is handed to a @link('./reporter.ts').
 * The default reporter is a tap reporter using the same conventions used by @link('https://github/substack/tape')
 */
export interface TestHarness extends Assert {
    report: (reporter?: Reporter) => Promise<void>;
}
export declare const harnessFactory: () => TestHarness;
