import { test } from 'zora';

test.only('should run', ({ only, test }) => {
  test('should not run', ({ ok }) => {
    ok(false);
  });

  only('only', (t) => {
    t.ok(true);
  });
});

test('failing', ({ ok }) => {
  ok(false);
});
