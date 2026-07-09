export const Operator = {
  EQUAL: 'equal',
  NOT_EQUAL: 'notEqual',
  IS: 'is',
  OK: 'ok',
  NOT_OK: 'notOk',
  IS_NOT: 'isNot',
  FAIL: 'fail',
  THROWS: 'throws',
};

export const getAssertionLocation = ({ rawStack }) => {
  const stackline = (rawStack || '')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('Error'));
  return (stackline || 'N/A').replace(/^at|^@/, '').trim();
};