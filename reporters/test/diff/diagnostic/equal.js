import { test } from 'zora';
import { Operator } from '../../../assert/src/utils.js';
import {
  getDiffCharThemedMessage,
  getEqualDiagnosticMessage,
} from '../../src/diff/diagnostic/equal.js';

const theme = new Proxy(
  {},
  {
    get: function (target, prop, receiver) {
      return (val) => `<${prop}>${val}</${prop}>`;
    },
  }
);

test(`equal diagnostic message`, (t) => {
  const getMessage = getEqualDiagnosticMessage(theme);

  t.test(`expected and actual have different types`, (t) => {
    t.eq(
      getMessage({
        actual: undefined,
        expected: { some: 'value' },
        operator: Operator.EQUAL,
      }),
      `expected a <emphasis>Object</emphasis> but got a <emphasis>undefined</emphasis>`
    );
  });

  t.test(`expected and actual have same type`, (t) => {
    t.test(`getDiffCharThemedMessage`, (t) => {
      const getMessage = getDiffCharThemedMessage(theme);
      const { expected, actual } = getMessage({
        actual: 'fob',
        expected: 'foo',
      });
      t.eq(expected, 'fo<diffExpected>o</diffExpected>');
      t.eq(actual, 'fo<diffActual>b</diffActual>');
    });
  });
});
