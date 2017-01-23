import deepEqual from 'deep-equal';

function insertAssertionHook (fn) {
  return function  (...args) {
    const assertResult = fn(...args);
    this.test.addAssertion(assertResult);
    return assertResult;
  }
}

const assertions = {
  ok: insertAssertionHook(function (val, message = 'should be truthy') {
    return {
      pass: Boolean(val),
      expected: 'truthy',
      actual: val,
      operator: 'ok',
      message
    };
  }),
  deepEqual:insertAssertionHook(function (actual, expected, message = 'should be equivalent') {
    return {
      pass: deepEqual(actual, expected),
      actual,
      expected,
      message,
      operator: 'deepEqual'
    };
  }),
  equal:insertAssertionHook(function(actual, expected, message = 'should be equal') {
    return {
      pass: actual === expected,
      actual,
      expected,
      message,
      operator: 'equal'
    };
  }),
  notOk:insertAssertionHook(function(val, message = 'should not be truthy') {
    return {
      pass: !Boolean(val),
      expected: 'falsy',
      actual: val,
      operator: 'notOk',
      message
    };
  }),
  notDeepEqual:insertAssertionHook(function(actual, expected, message = 'should not be equivalent') {
    return {
      pass: !deepEqual(actual, expected),
      actual,
      expected,
      message,
      operator: 'notDeepEqual'
    };
  }),
  notEqual:insertAssertionHook(function(actual, expected, message = 'should not be equal') {
    return {
      pass: actual !== expected,
      actual,
      expected,
      message,
      operator: 'notEqual'
    };
  }),
  throws:insertAssertionHook(function(func, expected, message) {
    let caught, pass, actual;
    if (typeof expected === 'string') {
      [expected, message] = [message, expected];
    }
    try {
      func();
    } catch (error) {
      caught = {error};
    }
    pass = caught !== undefined;
    actual = caught && caught.error;
    if (expected instanceof RegExp) {
      pass = expected.test(actual) || expected.test(actual && actual.message);
      expected = String(expected);
    } else if (typeof expected === 'function' && caught) {
      pass = actual instanceof expected;
      actual = actual.constructor;
    }
    return {
      pass,
      expected,
      actual,
      operator: 'throws',
      message: message || 'should throw'
    };
  }),
  doesNotThrow:insertAssertionHook(function(func, expected, message) {
    let caught;
    if (typeof expected === 'string') {
      [expected, message] = [message, expected];
    }
    try {
      func();
    } catch (error) {
      caught = {error};
    }
    return {
      pass: caught === undefined,
      expected: 'no thrown error',
      actual: caught && caught.error,
      operator: 'doesNotThrow',
      message: message || 'should not throw'
    };
  }),
  fail:insertAssertionHook(function(reason = 'fail called') {
    return {
      pass: false,
      actual: 'fail called',
      expected: 'fail not called',
      message: reason,
      operator: 'fail'
    };
  })
};

function assertion (test) {
  return Object.create(assertions, {test: {value: test}});
}

export default assertion;
