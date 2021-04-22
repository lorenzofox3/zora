const MESSAGE_TYPE = {
    TEST_START: 'TEST_START',
    ASSERTION: 'ASSERTION',
    TEST_END: 'TEST_END',
    BAIL_OUT: 'BAIL_OUT'
};

export const newTestMessage = ({description, skip}) => ({
    type: MESSAGE_TYPE.TEST_START,
    data: {description, skip}
});

export const assertionMessage = (data) => ({
    type: MESSAGE_TYPE.ASSERTION,
    data
});

export const testEndMessage = ({description, executionTime}) => ({
    type: MESSAGE_TYPE.TEST_END,
    data: {
        description,
        executionTime
    }
});

export const bailOutMessage = ({error}) => ({
    type: MESSAGE_TYPE.BAIL_OUT,
    data: {
        error
    }
});
