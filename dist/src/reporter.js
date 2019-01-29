import { assertionMessage } from './protocol';
import { isAssertionResult } from './assertion';
import { filter, map } from '@lorenzofox3/for-await';
const print = (message, offset = 0) => {
    console.log(message.padStart(message.length + (offset * 4))); // 4 white space used as indent (see tap-parser)
};
const printYAML = (obj, offset = 0) => {
    const YAMLOffset = offset + 0.5;
    print('---', YAMLOffset);
    for (const [prop, value] of Object.entries(obj)) {
        print(`${prop}: ${JSON.stringify(value)}`, YAMLOffset);
    }
    print('...', YAMLOffset);
};
const comment = (value, offset) => {
    print(`# ${value}`, offset);
};
const subTestPrinter = (prefix = '') => (message) => {
    const { data } = message;
    const value = `${prefix}${data.description}`;
    comment(value, message.offset);
};
const mochaTapSubTest = subTestPrinter('Subtest: ');
const tapeSubTest = subTestPrinter();
const assertPrinter = (diagnostic) => (message) => {
    const { data, offset } = message;
    const { pass, description, id } = data;
    const label = pass === true ? 'ok' : 'not ok';
    if (isAssertionResult(data)) {
        print(`${label} ${id} - ${description}`, offset);
        if (pass === false) {
            printYAML(diagnostic(data), offset);
        }
    }
    else {
        const comment = data.skip === true ? 'SKIP' : `${data.executionTime}ms`;
        print(`${pass ? 'ok' : 'not ok'} ${id} - ${description} # ${comment}`, message.offset);
    }
};
const tapeAssert = assertPrinter(({ id, pass, description, ...rest }) => rest);
const mochaTapAssert = assertPrinter(({ expected, id, pass, description, actual, operator, at, ...rest }) => ({
    wanted: expected,
    found: actual,
    at,
    operator,
    ...rest
}));
const testEnd = (message) => {
    const length = message.data.length;
    const { offset } = message;
    print(`1..${length}`, offset);
};
const printBailout = (message) => {
    print('Bail out! Unhandled error.');
};
export const reportAsMochaTap = (message) => {
    switch (message.type) {
        case "TEST_START" /* TEST_START */:
            mochaTapSubTest(message);
            break;
        case "ASSERTION" /* ASSERTION */:
            mochaTapAssert(message);
            break;
        case "TEST_END" /* TEST_END */:
            testEnd(message);
            break;
        case "BAIL_OUT" /* BAIL_OUT */:
            printBailout(message);
            throw message.data;
    }
};
export const reportAsTapeTap = (message) => {
    switch (message.type) {
        case "TEST_START" /* TEST_START */:
            tapeSubTest(message);
            break;
        case "ASSERTION" /* ASSERTION */:
            tapeAssert(message);
            break;
        case "BAIL_OUT" /* BAIL_OUT */:
            printBailout(message);
            throw message.data;
    }
};
const flatFilter = filter((message) => {
    return message.type === "TEST_START" /* TEST_START */
        || message.type === "BAIL_OUT" /* BAIL_OUT */
        || (message.type === "ASSERTION" /* ASSERTION */ && (isAssertionResult(message.data) || message.data.skip === true));
});
const flattenStream = (stream) => {
    let id = 0;
    const mapper = map(message => {
        if (message.type === "ASSERTION" /* ASSERTION */) {
            const mappedData = Object.assign(message.data, { id: ++id });
            return assertionMessage(mappedData, 0);
        }
        return Object.assign({}, message, { offset: 0 });
    });
    return mapper(flatFilter(stream));
};
const printSummary = (harness) => {
    print('', 0);
    comment(harness.pass ? 'ok' : 'not ok', 0);
    comment(`success: ${harness.successCount}`, 0);
    comment(`skipped: ${harness.skipCount}`, 0);
    comment(`failure: ${harness.failureCount}`, 0);
};
export const tapeTapLike = async (stream) => {
    print('TAP version 13');
    const streamInstance = flattenStream(stream);
    for await (const message of streamInstance) {
        reportAsTapeTap(message);
    }
    print(`1..${stream.count}`, 0);
    printSummary(stream);
};
export const mochaTapLike = async (stream) => {
    print('TAP version 13');
    for await (const message of stream) {
        reportAsMochaTap(message);
    }
    printSummary(stream);
};
