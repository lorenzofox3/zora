import { only, test } from '../../src/index.js';

test('should not run', (t) => {
  t.fail('I should not run ');
});

only('should run', (t) => {
  t.ok(true, 'I ran');
});
