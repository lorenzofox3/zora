export const MESSAGE_TYPE = {
  TEST_START: 'TEST_START',
  ASSERTION: 'ASSERTION',
  TEST_END: 'TEST_END',
  ERROR: 'ERROR',
  UNKNOWN: 'UNKNOWN',
};

export const newTestMessage = ({ description, skip }) => ({
  type: MESSAGE_TYPE.TEST_START,
  data: { description, skip },
});

export const assertionMessage = (data) => ({
  type: MESSAGE_TYPE.ASSERTION,
  data,
});

export const testEndMessage = ({ description, executionTime }) => ({
  type: MESSAGE_TYPE.TEST_END,
  data: {
    description,
    executionTime,
  },
});

export const errorMessage = ({ error }) => ({
  type: MESSAGE_TYPE.ERROR,
  data: {
    error,
  },
});

export const unknownMessage = ({ message }) => ({
  type: MESSAGE_TYPE.UNKNOWN,
  data: {
    message,
  },
});
