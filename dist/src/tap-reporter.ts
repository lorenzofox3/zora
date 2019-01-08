import {
    AssertionMessage,
    CommentMessage,
    Message,
    MessageType,
    StartTestMessage,
    TestEndMessage
} from './protocol';
import {isAssertionResult} from './assertion';

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

const printComment = (message: CommentMessage): void => {
    print(`# ${message.data}`, message.offset);
};

const printSubTest = (message: StartTestMessage): void => {
    const {data} = message;
    print(`# Subtest: ${data.description}`, message.offset);
};

const printAssert = (message: AssertionMessage): void => {
    const {data, offset} = message;
    const {pass, description, id} = data;
    const label = pass === true ? 'ok' : 'not ok';
    if (isAssertionResult(data)) {
        print(`${label} ${id} - ${description}`, offset);
        if (pass === false) {
            const {expected, actual, at, operator} = data;
            printYAML({expected, found: actual, wanted: expected, actual, at, operator}, offset);
        }
    } else {
        print(`${pass ? 'ok' : 'not ok' } ${id} - ${description} # ${data.executionTime}ms`, message.offset);
    }
};

const printTest = (message: TestEndMessage): void => {
    const {length} = message.data;
    print(`1..${length}`, message.offset);
};

// const printPlan = (message: PlanSummaryMessage): void => {
//     const {data, offset} = message;
//     print(`1..${data}`, offset);
// };

export const tap = (message: Message<any>): void => {
    switch (message.type) {
        case MessageType.TEST_START:
            printSubTest(message);
            break;
        case MessageType.ASSERTION:
            printAssert(message);
            break;
        case  MessageType.TEST_END:
            printTest(message);
            break;
        case MessageType.COMMENT:
            printComment(message);
            break;
    }
};

export const reporter = async (stream: AsyncIterable<Message<any>>): Promise<void> => {
    print('TAP version 13');
    for await (const message of stream) {
        tap(message);
    }
    // print(`1..2`);
    // summary
};
