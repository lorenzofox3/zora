import { only, test } from 'zora/dist/zora.js';

test('should not run', (t) => {
  t.fail('I should not run ');
});

only('should run', (t) => {
  t.ok(true, 'I ran');
});
