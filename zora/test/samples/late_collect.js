import { test } from 'zora';

test(`late collection`, async (t) => {
  t.ok(true);

  setTimeout(() => {
    t.ok(true);
  }, 50);
});
