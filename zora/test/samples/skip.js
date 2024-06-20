import { test, skip } from '../../src/index.js';

test('hello world', (t) => {
  t.ok(true);
  t.skip('blah', (t) => {
    t.ok(false);
  });
  t.skip('for some reason');
});

skip('failing text', (t) => {
  t.ok(false);
});
