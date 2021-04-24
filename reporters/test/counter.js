import { test } from 'zora';
import createCounter from '../src/counter.js';
import {
  testEndMessage,
  newTestMessage,
  errorMessage,
  assertionMessage,
} from '../src/protocol.js';

test('counter', ({ test }) => {
  test('with test end message', ({ eq }) => {
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

  test('with error message', ({ eq }) => {
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

  test('with test start message', ({ eq }) => {
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
      'should update counter when test is skipped'
    );
  });

  test('with assertion message', ({ eq }) => {
    const message = assertionMessage({
      pass: true,
    });
    const counter = createCounter();
    counter.increment(message);
    eq(counter, { success: 1, failure: 0, skip: 0, total: 1 });
    counter.increment(message);
    eq(counter, { success: 2, failure: 0, skip: 0, total: 2 });
    counter.increment(assertionMessage({ pass: false }));
    eq(counter, { success: 2, failure: 1, skip: 0, total: 3 });
  });
});
