import { isAssertionResult } from './assertion';
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
const printComment = (message) => {
    print(`# ${message.data}`, message.offset);
};
const printSubTest = (message) => {
    const { data } = message;
    print(`# Subtest: ${data.description}`, message.offset);
};
const printAssert = (message) => {
    const { data, offset } = message;
    const { pass, description, id } = data;
    const label = pass === true ? 'ok' : 'not ok';
    if (isAssertionResult(data)) {
        print(`${label} ${id} - ${description}`, offset);
        if (pass === false) {
            const { expected, actual, at, operator } = data;
            printYAML({ expected, found: actual, wanted: expected, actual, at, operator }, offset);
        }
    }
    else {
        print(`${pass ? 'ok' : 'not ok'} ${id} - ${description} # ${data.executionTime}ms`, message.offset);
    }
};
const printTest = (message) => {
    const { length } = message.data;
    print(`1..${length}`, message.offset);
};
// const printPlan = (message: PlanSummaryMessage): void => {
//     const {data, offset} = message;
//     print(`1..${data}`, offset);
// };
export const tap = (message) => {
    switch (message.type) {
        case "TEST_START" /* TEST_START */:
            printSubTest(message);
            break;
        case "ASSERTION" /* ASSERTION */:
            printAssert(message);
            break;
        case "TEST_END" /* TEST_END */:
            printTest(message);
            break;
        case "COMMENT" /* COMMENT */:
            printComment(message);
            break;
    }
};
export const reporter = async (stream) => {
    print('TAP version 13');
    for await (const message of stream) {
        tap(message);
    }
    // print(`1..2`);
    // summary
};
