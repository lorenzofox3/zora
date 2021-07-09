import { test } from 'zora';

test('will throw an error', (t) => {
  throw new Error('some error');
});
