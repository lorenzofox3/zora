import deepEqual from 'deep-equal';

const assertions = {
  ok(val, message = 'should be truthy'){
    const assertionResult = {pass: Boolean(val), expected: 'truthy', actual: val, operator: 'ok', message};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  deepEqual(actual, expected, message = 'should be equivalent'){
    const assertionResult = {pass: deepEqual(actual, expected), actual, expected, message, operator: 'deepEqual'};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  equal(actual, expected, message = 'should be equal'){
    const assertionResult = {pass: actual === expected, actual, expected, message, operator: 'equal'};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  throws(func, message = 'should throw'){
    try { func(); } catch (e) { var thrown = true, error = e; }
    const assertionResult = {pass: Boolean(thrown), expected: 'thrown error', actual: error, operator: 'throws', message};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  notOk(val, message = 'should not be truthy'){
    const assertionResult = {pass: !Boolean(val), expected: 'falsy', actual: val, operator: 'notOk', message};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  notDeepEqual(actual, expected, message = 'should not be equivalent'){
    const assertionResult = {pass: !deepEqual(actual, expected), actual, expected, message, operator: 'notDeepEqual'};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  notEqual(actual, expected, message = 'should not be equal'){
    const assertionResult = {pass: actual !== expected, actual, expected, message, operator: 'notEqual'};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  doesNotThrow(func, message = 'should not throw'){
    try { func(); } catch (e) { var thrown = true, error = e; }
    const assertionResult = {pass: !thrown, expected: 'no throws error', actual: error, operator: 'doesNotThrow', message};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  fail(reason = 'fail called'){
    const assertionResult = {
      pass: false,
      actual: 'fail called',
      expected: 'fail not called',
      message: reason,
      operator: 'fail'
    };
    this.test.addAssertion(assertionResult);
    return assertionResult;
  }
};

function assertion (test) {
  return Object.create(assertions, {test: {value: test}});
}

export default assertion;
