import { Message } from './protocol';
/**
 * A Reporter is a function which uses a Message stream to output meaningfully formatted data into an IO target (likely the console)
 */
export interface Reporter {
    (stream: AsyncIterable<Message<any>>): Promise<void>;
}
export declare const reportAsMochaTap: (message: Message<any>) => void;
export declare const reportAsTapeTap: (message: Message<any>) => void;
export declare const mochaTapLike: (stream: AsyncIterable<Message<any>>) => Promise<void>;
export declare const tapeTapLike: (stream: AsyncIterable<Message<any>>) => Promise<void>;
