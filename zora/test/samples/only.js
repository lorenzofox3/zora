import { only, test } from 'zora';

test('should not run', (t) => {
  t.fail('I should not run ');
});

only('should run', (t) => {
  t.ok(true, 'I ran');
});
