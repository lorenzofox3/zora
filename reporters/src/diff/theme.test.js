import { test } from 'zora';
import { createTheme, dark, light } from './theme.js';

test('createTheme', (t) => {
  const theme = createTheme();

  t.test('every themed function returns a string without throwing', (t) => {
    for (const key of [
      'errorBadge',
      'successBadge',
      'skipBadge',
      'disable',
      'header',
      'adorner',
      'emphasis',
      'operator',
      'light',
      'diffExpected',
      'diffActual',
    ]) {
      t.eq(typeof theme[key]('x'), 'string', `${key} returns a string`);
    }
  });

  t.test('preserves the underlying text content', (t) => {
    t.ok(theme.header('hello').includes('hello'));
    t.ok(theme.errorBadge('oops').includes('oops'));
    t.ok(theme.emphasis('important').includes('important'));
  });

  t.test('dark and light exports are usable theme instances', (t) => {
    t.eq(typeof dark.header('x'), 'string');
    t.eq(typeof light.header('x'), 'string');
  });
});
