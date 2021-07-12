import { test } from 'zora';
import { isEven } from '../../src/index';

test(`isEven`, (t) => {
  t.eq(isEven(1), true);
  t.eq(isEven(2), true);
});
