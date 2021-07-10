import { test } from 'zora';
import { isOdd } from '../../src/index.js';

test(`isOdd`, (t) => {
  t.eq(isOdd(1), true);
  t.eq(isOdd(2), true);
});
