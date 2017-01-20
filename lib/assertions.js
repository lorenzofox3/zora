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
  doesNotThrow(func, expected, message){
    if (typeof expected === 'string') {
      [expected, message] = [message, expected];
    }
    try {
      func();
    } catch (error) {
      var caught = { error };
    }
    const assertionResult = {pass: !caught, expected: 'no thrown error', actual: caught && caught.error, operator: 'doesNotThrow', message: message || 'should not throw'};
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
  throws(func, expected, message){
    if (typeof expected === 'string') {
      [expected, message] = [message, expected];
    }
    try {
      func();
    } catch (error) {
      var caught = { error };
    }
    let pass = Boolean(caught);
    let actual = caught && caught.error;
    if (expected instanceof RegExp) {
      pass = expected.test(actual) || expected.test(actual && actual.message);
      expected = String(expected);
    }
    else if (typeof expected === 'function' && caught) {
      pass = actual instanceof expected;
      actual = actual.constructor;
    }
    const assertionResult = {pass, expected, actual, operator: 'throws', message: message || 'should throw'};
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
