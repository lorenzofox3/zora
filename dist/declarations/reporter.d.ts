import { Message } from './protocol';
import { TestHarness } from './harness';
/**
 * A Reporter is a function which uses a Message stream to output meaningfully formatted data into an IO target (likely the console)
 */
export interface Reporter {
    (stream: AsyncIterable<Message<any>>): Promise<void>;
}
export declare const reportAsMochaTap: (message: Message<any>) => void;
export declare const reportAsTapeTap: (message: Message<any>) => void;
export declare const tapeTapLike: (stream: TestHarness) => Promise<void>;
export declare const mochaTapLike: (stream: TestHarness) => Promise<void>;
