import {isAssertionResult} from './assertion';
import {filter, map} from '@lorenzofox3/for-await';
import {
    AssertionResult,
    StartTestMessage,
    AssertionMessage,
    TestEndMessage,
    BailoutMessage,
    Message, MessageType, TestHarness
} from './interfaces';
import {assertionMessage} from './protocol';

const print = (message: string, offset = 0): void => {
    console.log(message.padStart(message.length + (offset * 4))); // 4 white space used as indent (see tap-parser)
};

const printYAML = (obj: object, offset = 0): void => {
    const YAMLOffset = offset + 0.5;
    print('---', YAMLOffset);
    for (const [prop, value] of Object.entries(obj)) {
        print(`${prop}: ${JSON.stringify(value)}`, YAMLOffset + 0.5);
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
        const comment = data.skip === true ? 'SKIP' : `${data.executionTime}ms`;
        print(`${pass ? 'ok' : 'not ok' } ${id} - ${description} # ${comment}`, message.offset);
    }

};
const tapeAssert = assertPrinter(({id, pass, description, ...rest}) => rest);
const mochaTapAssert = assertPrinter(({expected, id, pass, description, actual, operator, at, ...rest}) => ({
    wanted: expected,
    found: actual,
    at,
    operator,
    ...rest
}));

const testEnd = (message: TestEndMessage): void => {
    const length = message.data.length;
    const {offset} = message;
    print(`1..${length}`, offset);
};

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
            testEnd(message);
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
        case MessageType.BAIL_OUT:
            printBailout(message);
            throw message.data;
    }
};

const flatFilter = filter<Message<any>>((message) => {
    return message.type === MessageType.TEST_START
        || message.type === MessageType.BAIL_OUT
        || (message.type === MessageType.ASSERTION && (isAssertionResult(message.data) || message.data.skip === true));
});
const flattenStream = (stream: AsyncIterable<Message<any>>) => {
    let id = 0;
    const mapper = map<Message<any>>(message => {
        if (message.type === MessageType.ASSERTION) {
            const mappedData = <AssertionResult>Object.assign(message.data, {id: ++id});
            return assertionMessage(mappedData, 0);
        }
        return Object.assign({}, message, {offset: 0});
    });

    return mapper(flatFilter(stream));
};

const printSummary = (harness: TestHarness): void => {
    print('', 0);
    comment(harness.pass ? 'ok' : 'not ok', 0);
    comment(`success: ${harness.successCount}`, 0);
    comment(`skipped: ${harness.skipCount}`, 0);
    comment(`failure: ${harness.failureCount}`, 0);
};

export const tapeTapLike = async (stream: TestHarness): Promise<void> => {
    print('TAP version 13');
    const streamInstance = flattenStream(stream);
    for await (const message of streamInstance) {
        reportAsTapeTap(message);
    }
    print(`1..${stream.count}`, 0);
    printSummary(stream);
};

export const mochaTapLike = async (stream: TestHarness): Promise<void> => {
    print('TAP version 13');
    for await (const message of stream) {
        reportAsMochaTap(message);
    }
    printSummary(stream);
};

