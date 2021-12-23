import { test } from 'zora';
import { createCounter } from './counter.js';
import {
  testEndMessage,
  newTestMessage,
  errorMessage,
  assertionMessage,
} from './protocol.js';

test('counter', ({ test }) => {
  test('with tests end message, should not increment any value', ({ eq }) => {
    const counter = createCounter();
    const message = testEndMessage({
      description: 'example',
      executionTime: 42,
    });
    counter.increment(message);
    eq(counter, {
      success: 0,
      failure: 0,
      skip: 0,
      total: 0,
    });
    counter.increment(message);
    eq(counter, {
      success: 0,
      failure: 0,
      skip: 0,
      total: 0,
    });
  });

  test('with error message, should not increment any value', ({ eq }) => {
    const counter = createCounter();
    const message = errorMessage({ error: new Error('some error') });
    counter.increment(message);
    eq(counter, {
      success: 0,
      failure: 0,
      skip: 0,
      total: 0,
    });
    counter.increment(message);
    eq(counter, {
      success: 0,
      failure: 0,
      skip: 0,
      total: 0,
    });
  });

  test('with tests start message, should not increment any value', ({ eq }) => {
    const counter = createCounter();
    const message = newTestMessage({
      description: 'example',
      skip: false,
    });
    counter.increment(message);
    eq(
      counter,
      {
        success: 0,
        failure: 0,
        skip: 0,
        total: 0,
      },
      'should not increment the counter'
    );
    counter.increment(
      newTestMessage({
        description: 'example',
        skip: true,
      })
    );
    eq(
      counter,
      {
        success: 0,
        failure: 0,
        skip: 1,
        total: 1,
      },
      'should update counter when tests is skipped'
    );
  });

  test('with assertion message, should increment values depending on the test result', ({
    eq,
  }) => {
    const message = assertionMessage({
      pass: true,
    });
    const counter = createCounter();
    counter.increment(message);
    eq(
      counter,
      { success: 1, failure: 0, skip: 0, total: 1 },
      'when assertion is passing'
    );
    counter.increment(message);
    eq(counter, { success: 2, failure: 0, skip: 0, total: 2 });
    counter.increment(
      assertionMessage({ pass: false }),
      'when assertion is failing'
    );
    eq(counter, { success: 2, failure: 1, skip: 0, total: 3 });
  });
});
