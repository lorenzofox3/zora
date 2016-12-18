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