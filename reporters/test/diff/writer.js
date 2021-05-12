import { test } from 'zora';
import {
  getDiagnosticMessage,
  getSummaryMessage,
} from '../../src/diff/writer.js';
import { Operator } from '../../../assert/src/utils.js';

const theme = new Proxy(
  {},
  {
    get: function (target, prop, receiver) {
      return (val) => `<${prop}>${val}</${prop}>`;
    },
  }
);

const getMessage = getDiagnosticMessage({ theme });

test('diff writer', (t) => {
  t.test(`diagnostic messages`, (t) => {
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

  t.test(`summary message`, (t) => {
    const { fail, total, pass, skip } = getSummaryMessage({ theme });

    t.test(`fail`, (t) => {
      t.eq(
        fail({
          failure: 4,
          total: 4,
        }),
        `<errorBadge>FAIL:  4</errorBadge>`,
        'when failure count is greater than 0'
      );

      t.eq(
        fail({
          failure: 0,
          total: 4,
        }),
        `<disable>FAIL:  0</disable>`,
        'when failure count is 0'
      );

      t.eq(
        fail({
          failure: 4,
          total: 10,
        }),
        `<errorBadge>FAIL:   4</errorBadge>`,
        'when failure count is greater than 0 and total has one more digit'
      );

      t.eq(
        fail({
          failure: 0,
          total: 10,
        }),
        `<disable>FAIL:   0</disable>`,
        'when failure count is 0 and total has one more digit'
      );
    });

    t.test(`pass`, (t) => {
      t.eq(
        pass({
          failure: 1,
          success: 5,
          total: 6,
        }),
        `<disable>PASS:  5</disable>`,
        'when failure count is greater than 0'
      );

      t.eq(
        pass({
          failure: 0,
          success: 4,
          total: 4,
        }),
        `<successBadge>PASS:  4</successBadge>`,
        'when failure count is 0'
      );

      t.eq(
        pass({
          failure: 4,
          success: 6,
          total: 10,
        }),
        `<disable>PASS:   6</disable>`,
        'when failure count is greater than 0 and total has one more digit'
      );

      t.eq(
        pass({
          failure: 0,
          success: 9,
          total: 10,
        }),
        `<successBadge>PASS:   9</successBadge>`,
        'when failure count is 0 and total has one more digit'
      );
    });

    t.test(`skip`, (t) => {
      t.eq(
        skip({
          failure: 1,
          success: 5,
          total: 8,
          skip: 2,
        }),
        `<skipBadge>SKIP:  2</skipBadge>`,
        'when skip count is greater than 0'
      );

      t.eq(
        skip({
          failure: 0,
          success: 4,
          total: 4,
          skip: 0,
        }),
        `<disable>SKIP:  0</disable>`,
        'when skip count is 0'
      );

      t.eq(
        skip({
          failure: 4,
          skip: 3,
          success: 3,
          total: 10,
        }),
        `<skipBadge>SKIP:   3</skipBadge>`,
        'when skip count is greater than 0 and total has one more digit'
      );

      t.eq(
        skip({
          failure: 1,
          skip: 0,
          success: 9,
          total: 10,
        }),
        `<disable>SKIP:   0</disable>`,
        'when skip count is 0 and total has one more digit'
      );
    });

    t.test(`total`, (t) => {
      t.eq(total({ total: 4 }), '<header>TOTAL:  4</header>');
      t.eq(total({ total: 10 }), '<header>TOTAL:  10</header>');
      t.eq(total({ total: 100 }), '<header>TOTAL:  100</header>');
    });
  });
});
