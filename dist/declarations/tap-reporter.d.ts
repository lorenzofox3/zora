import { Message } from './protocol';
export declare const tap: (message: Message<any>) => void;
export declare const reporter: (stream: AsyncIterable<Message<any>>) => Promise<void>;
