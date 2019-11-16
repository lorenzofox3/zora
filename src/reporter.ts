import {isAssertionResult} from './assertion';
import {
    AssertionMessage,
    BailoutMessage,
    MessageType,
    StartTestMessage,
    TestEndMessage,
    TestHarness
} from './interfaces';
import {map} from './commons';

const flatten = map(m => {
    m.offset = 0;
    return m;
});

const print = (message: string, offset = 0): void => {
    console.log(message.padStart(message.length + (offset * 4))); // 4 white space used as indent (see tap-parser)
};

const stringifySymbol = (key, value) => {
    if (typeof value === 'symbol') {
        return value.toString();
    }

    return value;
};

const printYAML = (obj: object, offset = 0): void => {
    const YAMLOffset = offset + 0.5;
    print('---', YAMLOffset);
    for (const [prop, value] of Object.entries(obj)) {
        print(`${prop}: ${JSON.stringify(value, stringifySymbol)}`, YAMLOffset + 0.5);
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
const indentedSubTest = subTestPrinter('Subtest: ');
const flatSubTest = subTestPrinter();

const testEnd = (message: TestEndMessage): void => {
    const length = message.data.length;
    const {offset} = message;
    print(`1..${length}`, offset);
};

const bailOut = (message: BailoutMessage) => {
    print('Bail out! Unhandled error.');
};

const indentedDiagnostic = ({expected, pass, description, actual, operator, at = 'N/A', ...rest}) => ({
    wanted: expected,
    found: actual,
    at,
    operator,
    ...rest
});
const flatDiagnostic = ({pass, description, ...rest}) => rest;

const indentedAssertion = (message: AssertionMessage, idIter: Iterator<number>) => {
    const {data, offset} = message;
    const {pass, description} = data;
    const label = pass === true ? 'ok' : 'not ok';
    const {value: id} = idIter.next();
    if (isAssertionResult(data)) {
        print(`${label} ${id} - ${description}`, offset);
        if (pass === false) {
            printYAML(indentedDiagnostic(data), offset);
        }
    } else {
        const comment = data.skip === true ? 'SKIP' : `${data.executionTime}ms`;
        print(`${pass ? 'ok' : 'not ok'} ${id} - ${description} # ${comment}`, message.offset);
    }
};

const flatAssertion = (message: AssertionMessage, idIter: Iterator<number>) => {
    const {data, offset} = message;
    const {pass, description} = data;
    const label = pass === true ? 'ok' : 'not ok';
    if (isAssertionResult(data)) {
        const {value: id} = idIter.next();
        print(`${label} ${id} - ${description}`, offset);
        if (pass === false) {
            printYAML(flatDiagnostic(data), offset);
        }
    } else if (data.skip) {
        const {value: id} = idIter.next();
        print(`${pass ? 'ok' : 'not ok'} ${id} - ${description} # SKIP`, offset);
    }
};

const indentedReport = (message, id) => {
    switch (message.type) {
        case MessageType.TEST_START:
            id.fork();
            indentedSubTest(message);
            break;
        case MessageType.ASSERTION:
            indentedAssertion(message, id);
            break;
        case  MessageType.TEST_END:
            id.merge();
            testEnd(message);
            break;
        case MessageType.BAIL_OUT:
            bailOut(message);
            throw message.data;
    }
};

const flatReport = (message, id) => {
    switch (message.type) {
        case MessageType.TEST_START:
            flatSubTest(message);
            break;
        case MessageType.ASSERTION:
            flatAssertion(message, id);
            break;
        case MessageType.BAIL_OUT:
            bailOut(message);
            throw message.data;
    }
};

const summary = (harness: TestEndMessage): void => {
    print('', 0);
    comment(harness.data.pass ? 'ok' : 'not ok', 0);
    comment(`success: ${harness.data.successCount}`, 0);
    comment(`skipped: ${harness.data.skipCount}`, 0);
    comment(`failure: ${harness.data.failureCount}`, 0);
};

const id = function* () {
    let i = 0;
    while (true) {
        yield ++i;
    }
};

interface IdGenerator extends IterableIterator<number> {
    fork(): void;

    merge(): void;
}

const idGen = (): IdGenerator => {
    let stack = [id()];
    return {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            return stack[0].next();
        },
        fork() {
            stack.unshift(id());
        },
        merge() {
            stack.shift();
        }
    };
};

export const tapeTapLike = async (stream: TestHarness): Promise<void> => {
    const src = flatten(stream);
    const id = idGen();
    let lastMessage = null;
    print('TAP version 13');
    for await (const message of src) {
        lastMessage = message;
        flatReport(message, id);
    }
    print(`1..${stream.count}`, 0);
    summary(lastMessage);
};

export const mochaTapLike = async (stream: TestHarness): Promise<void> => {
    print('TAP version 13');
    const id = idGen();
    let lastMessage = null;
    for await (const message of stream) {
        lastMessage = message;
        indentedReport(message, id);
    }
    summary(lastMessage);
};