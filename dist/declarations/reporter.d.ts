import { Message, TestHarness } from './interfaces';
export declare const reportAsMochaTap: (message: Message<any>) => void;
export declare const reportAsTapeTap: (message: Message<any>) => void;
export declare const tapeTapLike: (stream: TestHarness) => Promise<void>;
export declare const mochaTapLike: (stream: TestHarness) => Promise<void>;
