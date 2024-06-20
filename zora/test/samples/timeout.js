import { test } from '../../src/index.js';
import { setTimeout } from 'node:timers/promises';

test(
  'broken promise',
  ({ ok }) => {
    return new Promise(() => {
    }).then(() => {
      ok(true);
    });
  },
  { timeout: 500 }
);

test('timeout in a nested test', ({ test }) => {
  test(
    'nested',
    ({ ok }) => {
      return new Promise(() => {
      }).then(() => {
        ok(true);
      });
    },
    { timeout: 500 }
  );
});

test('just too long', ({ test }) => {
  test(
    'on time',
    async ({ ok }) => {
      await setTimeout(700);
      ok(true);
    },
    { timeout: 1000 }
  );

  test(
    'too late',
    async ({ ok }) => {
      await setTimeout(700);
      ok(true);
    },
    { timeout: 500 }
  );
});
