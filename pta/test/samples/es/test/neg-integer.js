import { test } from 'zora';
import sum from '../src/sum.js';

test('valid sum', (t) => {
  t.eq(sum(2, -1), 1);
  t.eq(sum(0, -42), -42);
});
