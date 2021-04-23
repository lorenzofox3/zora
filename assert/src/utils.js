export const Operator = {
    EQUAL: 'equal',
    NOT_EQUAL: 'notEqual',
    IS: 'is',
    OK: 'ok',
    NOT_OK: 'notOk',
    IS_NOT: 'isNot',
    FAIL: 'fail',
    THROWS: 'throws'
};

const specFnRegexp = /zora_spec_fn/;
const zoraInternal = /zora\/dist/;
const filterStackLine = l => (l && !zoraInternal.test(l) && !l.startsWith('Error') || specFnRegexp.test(l));

const getAssertionLocation = () => {
    const err = new Error();
    const stack = (err.stack || '')
        .split('\n')
        .map(l => l.trim())
        .filter(filterStackLine);
    const userLandIndex = stack.findIndex(l => specFnRegexp.test(l));
    const stackline = userLandIndex >= 1 ? stack[userLandIndex - 1] : (stack[0] || 'N/A');
    return stackline
        .replace(/^at|^@/, '');
};

export const decorateWithLocation = (result) => {
    if (!result.pass) {
        result.at = getAssertionLocation();
    }
    return result;
};
