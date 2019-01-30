import { Test } from './interfaces';
export declare const defaultTestOptions: Readonly<{
    offset: number;
    skip: boolean;
}>;
export declare const noop: () => void;
export declare const tester: (description: any, spec: any, { offset, skip }?: Readonly<{
    offset: number;
    skip: boolean;
}>) => Test;
