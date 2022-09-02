import { test } from 'zora/dist/zora.js';

test('circular ref in diagnostic', (t) => {
  const b = { key: 'prop' };
  const a = { foo: 'bar', b };

  b.a = a;

  t.eq(a, { foo: 'bar', b: { key: 'prop' } });
});
