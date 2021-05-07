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

    t.skip(`equal diagnostic message`, (t) => {
      // todo
      const foo = 'I am string';
    });
  });

  t.skip(`summary message`, (t) => {
    const getMessage = getSummaryMessage({ theme });

    const expected = `
    
    `;
    t.eq(getMessage({ success: 3, skip: 2, failure: 4, total: 9 }), expected);
  });
});
