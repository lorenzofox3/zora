import { test } from 'zora';
import { getDiffCharThemedMessage } from '../../../src/diff/diagnostic/equal.js';

const theme = new Proxy(
  {},
  {
    get: function (target, prop, receiver) {
      return (val) => `<${prop}>${val}</${prop}>`;
    },
  }
);

test(`getDiffCharThemedMessage`, (t) => {
  const getMessage = getDiffCharThemedMessage(theme);
  const { expected, actual } = getMessage({
    actual: 'fob',
    expected: 'foo',
  });
  t.eq(expected, 'fo<diffExpected>o</diffExpected>');
  t.eq(actual, 'fo<diffActual>b</diffActual>');
});
