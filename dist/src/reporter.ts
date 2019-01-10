import {
    assertionMessage,
    AssertionMessage, BailoutMessage,
    Message,
    MessageType,
    StartTestMessage,
    TestEndMessage
} from './protocol';
import {AssertionResult, isAssertionResult} from './assertion';
import {filter, map} from '@lorenzofox3/for-await';

/**
 * A Reporter is a function which uses a Message stream to output meaningfully formatted data into an IO target (likely the console)
 */
export interface Reporter {
    (stream: AsyncIterable<Message<any>>): Promise<void>;
}

const print = (message: string, offset = 0): void => {
    console.log(message.padStart(message.length + (offset * 4))); // 4 white space used as indent (see tap-parser)
};

const printYAML = (obj: object, offset = 0): void => {
    const YAMLOffset = offset + 0.5;
    print('---', YAMLOffset);
    for (const [prop, value] of Object.entries(obj)) {
        print(`${prop}: ${JSON.stringify(value)}`, YAMLOffset);
    }
    print('...', YAMLOffset);
};

const comment = (value: string, offset: number): void => {
    print(`# ${value}`, offset);
};

const subTestPrinter = (prefix = '') => (message: StartTestMessage): void => {
    const {data} = message;
    const value = `${prefix}${data.description}`;
    comment(value, message.offset);
};
const mochaTapSubTest = subTestPrinter('Subtest: ');
const tapeSubTest = subTestPrinter();

const assertPrinter = (diagnostic: (assertionResult: AssertionResult) => Object) => (message: AssertionMessage): void => {
    const {data, offset} = message;
    const {pass, description, id} = data;
    const label = pass === true ? 'ok' : 'not ok';
    if (isAssertionResult(data)) {
        print(`${label} ${id} - ${description}`, offset);
        if (pass === false) {
            printYAML(diagnostic(data), offset);
        }
    } else {
        print(`${pass ? 'ok' : 'not ok' } ${id} - ${description} # ${data.executionTime}ms`, message.offset);
    }
};
const tapeAssert = assertPrinter(val => val);
const mochaTapAssert = assertPrinter(({expected, actual, operator, at}) => ({
    wanted: expected,
    found: actual,
    at,
    operator
}));

const testPrinter = (lengthProp: string) => (message: TestEndMessage): void => {
    const length = message.data[lengthProp];
    const {offset} = message;
    if (offset === 0) {
        print('');
    }
    print(`1..${length}`, offset);
    if (offset === 0) {
        comment(message.data.pass ? 'ok' : 'not ok', 0);
    }
};
const mochaTapTest = testPrinter('length');
const tapeTest = testPrinter('fullLength');

const printBailout = (message: BailoutMessage) => {
    print('Bail out! Unhandled error.');
};

export const reportAsMochaTap = (message: Message<any>): void => {
    switch (message.type) {
        case MessageType.TEST_START:
            mochaTapSubTest(message);
            break;
        case MessageType.ASSERTION:
            mochaTapAssert(message);
            break;
        case  MessageType.TEST_END:
            mochaTapTest(message);
            break;
        case MessageType.BAIL_OUT:
            printBailout(message);
            throw message.data;
    }
};

export const reportAsTapeTap = (message: Message<any>): void => {
    switch (message.type) {
        case MessageType.TEST_START:
            tapeSubTest(message);
            break;
        case MessageType.ASSERTION:
            tapeAssert(message);
            break;
        case  MessageType.TEST_END:
            tapeTest(message);
            break;
        case MessageType.BAIL_OUT:
            printBailout(message);
            throw message.data;
    }
};

export const mochaTapLike = async (stream: AsyncIterable<Message<any>>): Promise<void> => {
    print('TAP version 13');
    for await (const message of stream) {
        reportAsMochaTap(message);
    }
};

const flatFilter = filter<Message<any>>((message) => {
    return message.type === MessageType.TEST_START
        || message.type === MessageType.BAIL_OUT
        || (message.type === MessageType.ASSERTION && isAssertionResult(message.data))
        || (message.type === MessageType.TEST_END && message.offset === 0);
});
const flattenStream = (stream: AsyncIterable<Message<any>>) => {
    let id = 0;
    const mapper = map<Message<any>>(message => {
        if (message.type === MessageType.ASSERTION) {
            const mappedData = <AssertionResult>Object.assign({}, message.data, {id: ++id});
            return assertionMessage(
                mappedData
                , 0);
        }
        return Object.assign({}, message, {offset: 0});
    });

    return mapper(flatFilter(stream));
};
export const tapeTapLike = async (stream: AsyncIterable<Message<any>>): Promise<void> => {
    print('TAP version 13');
    for await (const message of flattenStream(stream)) {
        reportAsTapeTap(message);
    }
};
