import { test } from 'zora';
import { Operator } from '../../../../assert/src/utils.js';
import getDiagnosticMessage from '../../../src/diff/writer/diagnostic.js';
import getEqualDiagnosticMessage, {
  getDiffCharThemedMessage,
} from '../../../src/diff/diagnostic/equal.js';

const theme = new Proxy(
  {},
  {
    get: function (target, prop, receiver) {
      return (val) => `<${prop}>${val}</${prop}>`;
    },
  }
);

const getMessage = getDiagnosticMessage({ theme });

test(`diagnostic messages`, (t) => {
  t.test(`equal diagnostic message`, (t) => {
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

    t.test(`expected and actual are strings`, (t) => {
      t.eq(
        getMessage({
          actual: 'fob',
          expected: 'foo',
          operator: Operator.EQUAL,
        }),
        `diff in strings:
  <errorBadge>- actual</errorBadge> <successBadge>+ expected</successBadge>
  
  <errorBadge>-</errorBadge> fo<diffActual>b</diffActual>
  <successBadge>+</successBadge> fo<diffExpected>o</diffExpected>`
      );
    });
  });

  t.test(`ok diagnostic message`, (t) => {
    t.eq(
      getMessage({ actual: null, operator: Operator.OK }),
      `expected <emphasis>"truthy"</emphasis> but got <emphasis>null</emphasis>`
    );

    t.eq(
      getMessage({ actual: '', operator: Operator.OK }),
      `expected <emphasis>"truthy"</emphasis> but got <emphasis>""</emphasis>`,
      'display double quotes when actual is an empty string'
    );
  });

  t.test(`notOk diagnostic message`, (t) => {
    t.eq(
      getMessage({ actual: 'foo', operator: Operator.NOT_OK }),
      `expected <emphasis>"falsy"</emphasis> but got <emphasis>"foo"</emphasis>`
    );

    t.eq(
      getMessage({ actual: {}, operator: Operator.NOT_OK }),
      `expected <emphasis>"falsy"</emphasis> but got <emphasis>{}</emphasis>`
    );

    t.eq(
      getMessage({ actual: [], operator: Operator.NOT_OK }),
      `expected <emphasis>"falsy"</emphasis> but got <emphasis>[]</emphasis>`
    );
  });

  t.test(`fail diagnostic message`, (t) => {
    t.eq(
      getMessage({
        description: 'should not get here',
        operator: Operator.FAIL,
      }),
      `expected <emphasis>fail</emphasis> not to be called, but was called as <emphasis>"should not get here"</emphasis>`
    );
  });

  t.test(`notEqual diagnostic message`, (t) => {
    t.eq(
      getMessage({ operator: Operator.NOT_EQUAL }),
      `expected the arguments <emphasis>not to be equivalent</emphasis> but they were`
    );
  });

  t.test(`is diagnostic message`, (t) => {
    t.eq(
      getMessage({ operator: Operator.IS }),
      `expected <emphasis>references to be the same</emphasis> but they were not`
    );
  });

  t.test(`isNot diagnostic message`, (t) => {
    t.eq(
      getMessage({ operator: Operator.IS_NOT }),
      `expected <emphasis>references not to be the same</emphasis> but they were`
    );
  });

  t.test(`unknown operator diagnostic message`, (t) => {
    t.eq(
      getMessage({ operator: 'wooty' }),
      `unknown operator <emphasis>wooty</emphasis>`
    );
  });

  t.skip(`throws diagnostic message`, (t) => {});

  t.test(`equal diagnostic message`, (t) => {
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
});
