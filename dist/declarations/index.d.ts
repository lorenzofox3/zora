import { SpecFunction } from './assertion';
export * from './assertion';
export interface TestHarness {
    test: (description: string, specFn: SpecFunction, options?: object) => void;
    run: () => Promise<void>;
}
export declare const test: (description: string, specFn: SpecFunction, options?: object) => void;
export declare const createHarness: (reporter?: (stream: AsyncIterable<import("./protocol").Message<any>>) => Promise<void>) => TestHarness;
