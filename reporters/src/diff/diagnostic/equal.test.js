import { test } from 'zora';
import { diffLine, expandNewLines, getDiffCharThemedMessage } from './equal.js';

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

test('getDiffJSONThemedMessage', (t) => {
  t.test(`expandNewLines`, (t) => {
    const lines = [
      { value: '{\n  "foo": "bar",\n' },
      {
        removed: true,
        value: '  "other": "waht"\n',
      },
      {
        added: true,
        value: '  "other": "what"\n',
      },
      { value: '}' },
    ];

    const actual = expandNewLines(lines);

    t.eq(actual, [
      { value: '{' },
      { value: '  "foo": "bar",' },
      {
        removed: true,
        value: '  "other": "waht"',
      },
      { added: true, value: '  "other": "what"' },
      { value: '}' },
    ]);
  });

  t.test(`diffLine`, (t) => {
    const diff = diffLine(theme);
    t.eq(
      diff({ added: true, value: 'foo' }),
      '<successBadge>+</successBadge> foo'
    );
    t.eq(
      diff({ removed: true, value: 'foo' }),
      '<errorBadge>-</errorBadge> foo'
    );
    t.eq(diff({ value: 'foo' }), '   <disable>foo</disable>');
  });
});
