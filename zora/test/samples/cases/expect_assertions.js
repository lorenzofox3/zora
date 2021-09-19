import { test } from 'zora';

test('hello world', (t) => {
  t.ok(true);
}, { expectAssertions: 1 });

test('failing text', (t) => {
  t.ok(true);
}, { expectAssertions: 2 });
