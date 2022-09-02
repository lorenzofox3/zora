import { Assert, test } from 'zora';

Assert.isFoo = (value, description = 'should be "foo"') => ({
  pass: value === 'foo',
  expected: 'foo',
  actual: value,
  operator: 'isFoo',
  description,
  other: 'property',
});

test('tester 1', (t) => {
  t.equal('foo', 'foo', 'foo should equal foo');
  t.isFoo('blah');
});
