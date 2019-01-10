/**
 * Emitted when a new sub test has started
 * @param {{description}} test - A Test
 * @param {number} offset - give the nested level
 * @returns {StartTestMessage}
 */
export const startTestMessage = (test, offset) => ({
    type: "TEST_START" /* TEST_START */,
    data: test,
    offset
});
/**
 * Emitted when an assertion result is produced. Note than when a sub test finishes, it also emits an assertion result in the parent sub test stream
 * @param {TestResult | AssertionResult} assertion
 * @param {number} offset - give the nested level
 * @returns {AssertionMessage}
 */
export const assertionMessage = (assertion, offset) => ({
    type: "ASSERTION" /* ASSERTION */,
    data: assertion,
    offset
});
/**
 * Emitted when a sub tests finishes
 * @param {Test} test - The Sub test
 * @param {number} offset - the nested level
 * @returns {TestEndMessage}
 */
export const endTestMessage = (test, offset) => ({
    type: "TEST_END" /* TEST_END */,
    data: test,
    offset
});
/**
 * Emitted when an error is not handled
 * @param {Error} error
 * @param {number} offset
 * @returns {BailoutMessage}
 */
export const bailout = (error, offset) => ({
    type: "BAIL_OUT" /* BAIL_OUT */,
    data: error,
    offset
});
