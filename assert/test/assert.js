import { test } from 'zora';
import {
  equal,
  fail,
  is,
  isNot,
  notEqual,
  notOk,
  ok,
  throws,
} from '../src/assert.js';

test('"equal" operator', ({ eq }) => {
  eq(
    equal('foo', 'foo', 'a description'),
    {
      pass: true,
      actual: 'foo',
      expected: 'foo',
      description: 'a description',
      operator: 'equal',
    },
    'should return a passing assert result when both string literals are equal'
  );

  eq(
    equal(4, 4, 'a description'),
    {
      pass: true,
      actual: 4,
      expected: 4,
      description: 'a description',
      operator: 'equal',
    },
    'should return a passing assert result when both number literals are equal'
  );

  eq(
    equal(true, true, 'a description'),
    {
      pass: true,
      actual: true,
      expected: true,
      description: 'a description',
      operator: 'equal',
    },
    'should return a passing assert result when both boolean literals are equal'
  );

  eq(
    equal({ prop: 'val' }, { prop: 'val' }, 'a description'),
    {
      pass: true,
      actual: { prop: 'val' },
      expected: { prop: 'val' },
      description: 'a description',
      operator: 'equal',
    },
    'should return a passing assert result when two object are deeply equal'
  );

  eq(
    equal('foo', 'bar'),
    {
      pass: false,
      actual: 'foo',
      expected: 'bar',
      description: 'should be equivalent',
      operator: 'equal',
    },
    'should return a failing assert result when two string literals are different'
  );

  eq(
    equal(4, 5, 'a description'),
    {
      pass: false,
      actual: 4,
      expected: 5,
      description: 'a description',
      operator: 'equal',
    },
    'should return a failing assert result when two number literals are different'
  );

  eq(
    equal(true, false, 'a description'),
    {
      pass: false,
      actual: true,
      expected: false,
      description: 'a description',
      operator: 'equal',
    },
    'should return a failing assert result when two boolean literals are different'
  );

  eq(
    equal({ prop: 'val' }, { prop: 'val' }, 'a description'),
    {
      pass: true,
      actual: { prop: 'val' },
      expected: { prop: 'val' },
      description: 'a description',
      operator: 'equal',
    },
    'should return a passing assert result when two object are deeply equal'
  );
});

test('"not equal" operator', ({ eq }) => {
  eq(
    notEqual('foo', 'bar'),
    {
      pass: true,
      actual: 'foo',
      expected: 'bar',
      description: 'should not be equivalent',
      operator: 'notEqual',
    },
    'should return a passing assert result'
  );

  eq(
    notEqual('foo', 'foo'),
    {
      pass: false,
      actual: 'foo',
      expected: 'foo',
      description: 'should not be equivalent',
      operator: 'notEqual',
    },
    'should return a failing assert result'
  );
});

test('"is" operator', ({ eq }) => {
  const instance = {};
  eq(
    is({ foo: 'bar' }, { foo: 'bar' }),
    {
      pass: false,
      actual: { foo: 'bar' },
      expected: { foo: 'bar' },
      description: 'should be the same',
      operator: 'is',
    },
    'should return a failing assert result when references are different'
  );
  eq(
    is(instance, instance),
    {
      pass: true,
      actual: {},
      expected: {},
      description: 'should be the same',
      operator: 'is',
    },
    'should return a passing assert result when references are the same'
  );
});

test('"isNot" operator', ({ eq }) => {
  const instance = {};
  eq(
    isNot({ foo: 'bar' }, { foo: 'bar' }),
    {
      pass: true,
      actual: { foo: 'bar' },
      expected: { foo: 'bar' },
      description: 'should not be the same',
      operator: 'isNot',
    },
    'should return a passing assert result when references are different'
  );

  eq(
    isNot(instance, instance),
    {
      pass: false,
      actual: {},
      expected: {},
      description: 'should not be the same',
      operator: 'isNot',
    },
    'should return a failing assert result when references are the same'
  );
});

test('"ok" operator', ({ eq }) => {
  eq(
    ok('truthy'),
    {
      pass: true,
      actual: 'truthy',
      description: 'should be truthy',
      expected: 'truthy value',
      operator: 'ok',
    },
    'should return a passing assert result when actual value is truthy'
  );

  eq(
    ok(null),
    {
      pass: false,
      actual: null,
      expected: 'truthy value',
      description: 'should be truthy',
      operator: 'ok',
    },
    'should return a failing assert result when actual value is not truthy'
  );

  eq(
    ok(undefined),
    {
      pass: false,
      actual: undefined,
      expected: 'truthy value',
      description: 'should be truthy',
      operator: 'ok',
    },
    'should return a failing assert result when actual value is not truthy'
  );

  eq(
    ok(''),
    {
      pass: false,
      actual: '',
      expected: 'truthy value',
      description: 'should be truthy',
      operator: 'ok',
    },
    'should return a failing assert result when actual value is not truthy'
  );
});

test('"notOk" operator', ({ eq }) => {
  eq(
    notOk('truthy'),
    {
      pass: false,
      actual: 'truthy',
      description: 'should be falsy',
      expected: 'falsy value',
      operator: 'notOk',
    },
    'should return a failing assert result when actual value is not falsy'
  );

  eq(
    notOk(null),
    {
      pass: true,
      actual: null,
      expected: 'falsy value',
      description: 'should be falsy',
      operator: 'notOk',
    },
    'should return a passing assert result when actual value is falsy'
  );
});

test('"fail" operator', ({ eq }) => {
  eq(
    fail('this should fail'),
    {
      pass: false,
      actual: 'fail called',
      expected: 'fail not called',
      description: 'this should fail',
      operator: 'fail',
    },
    'should always return a failing assert result'
  );
});

test('throws', ({ eq }) => {
  const regexp = /^totally/i;

  class CustomError extends Error {
    constructor() {
      super('custom error');
    }
  }

  eq(
    throws(() => {
      throw new Error('Totally expected error');
    }, regexp),
    {
      pass: true,
      actual: 'Totally expected error',
      expected: '/^totally/i',
      description: 'should throw',
      operator: 'throws',
    },
    'expected is a regexp, passing'
  );

  eq(
    throws(() => {
      throw new Error('not the expected error');
    }, regexp),
    {
      pass: false,
      actual: 'not the expected error',
      expected: '/^totally/i',
      description: 'should throw',
      operator: 'throws',
    },
    'expected is a regexp, failing'
  );

  eq(
    throws(() => {
      throw new CustomError();
    }, CustomError),
    {
      pass: true,
      actual: CustomError,
      expected: CustomError,
      description: 'should throw',
      operator: 'throws',
    },
    'expected is a constructor, passing'
  );

  eq(
    throws(() => {
      throw new Error();
    }, CustomError),
    {
      pass: false,
      actual: Error,
      expected: CustomError,
      description: 'should throw',
      operator: 'throws',
    },
    'expected is a constructor, failing'
  );
});
