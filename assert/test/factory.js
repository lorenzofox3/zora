import { test } from 'zora';
import createAssert, { Assert } from '../src/index.js';

const omitAt = ({ at, ...rest }) => rest;

// use callback
test('use callback', ({ eq }) => {
  const assertions = [];
  const onResult = (result) => assertions.push(result);

  const assert = createAssert({ onResult });

  assert.eq('foo', 'foo');
  assert.eq('foo', 'bar');

  eq(assertions.map(omitAt), [
    {
      pass: true,
      actual: 'foo',
      expected: 'foo',
      description: 'should be equivalent',
      operator: 'equal',
    },
    {
      pass: false,
      actual: 'foo',
      expected: 'bar',
      description: 'should be equivalent',
      operator: 'equal',
    },
  ]);

  eq(Boolean(assertions[0].at), false);
  eq(
    Boolean(assertions[1].at),
    true,
    'should have decorated the result with the location'
  );
});

// upgrade API
test('upgrade API', ({ eq }) => {
  Assert.isFoo = (expected, description = 'should be foo') => {
    return {
      pass: expected === 'foo',
      expected,
      actual: 'foo',
      operator: 'isFoo',
      description,
    };
  };

  const assertions = [];
  const onResult = (result) => assertions.push(result);

  const assert = createAssert({ onResult });

  assert.isFoo('foo');
  assert.isFoo('bar');

  eq(assertions.map(omitAt), [
    {
      pass: true,
      actual: 'foo',
      expected: 'foo',
      description: 'should be foo',
      operator: 'isFoo',
    },
    {
      pass: false,
      actual: 'foo',
      expected: 'bar',
      description: 'should be foo',
      operator: 'isFoo',
    },
  ]);

  eq(Boolean(assertions[0].at), false);
  eq(
    Boolean(assertions[1].at),
    true,
    'should have decorated the result with the location'
  );
});

// bind functions
test('bind functions', ({ eq }) => {
  const assertions = [];
  const onResult = (result) => assertions.push(result);

  const { eq: t } = createAssert({ onResult });

  t('foo', 'foo');
  t('foo', 'bar');

  eq(assertions.map(omitAt), [
    {
      pass: true,
      actual: 'foo',
      expected: 'foo',
      description: 'should be equivalent',
      operator: 'equal',
    },
    {
      pass: false,
      actual: 'foo',
      expected: 'bar',
      description: 'should be equivalent',
      operator: 'equal',
    },
  ]);

  eq(Boolean(assertions[0].at), false);
  eq(
    Boolean(assertions[1].at),
    true,
    'should have decorated the result with the location'
  );
});
