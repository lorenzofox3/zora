import { test } from '../../src/index.js';

test(`late collection`, async (t) => {
  t.ok(true);

  setTimeout(() => {
    t.ok(true);
  }, 50);
});
