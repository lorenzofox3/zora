import { test } from 'zora';
import {
  failDiagnosticMessage,
  isDiagnosticMessage,
  isNotDiagnosticMessage,
  notEqualDiagnosticMessage,
  notOkDiagnosticMessage,
  okDiagnosticMessage,
} from '../../src/diff/writer.js';

const theme = new Proxy(
  {},
  {
    get: function (target, prop, receiver) {
      return (val) => `<${prop}>${val}</${prop}>`;
    },
  }
);

test('diff writer', (t) => {
  t.test(`ok diagnostic message`, (t) => {
    const getMessage = okDiagnosticMessage({ theme });

    t.eq(
      getMessage({ actual: null }),
      `expected <emphasis>"truthy"</emphasis> but got <emphasis>null</emphasis>`
    );

    t.eq(
      getMessage({ actual: '' }),
      `expected <emphasis>"truthy"</emphasis> but got <emphasis>""</emphasis>`,
      'display double quotes when actual is an empty string'
    );
  });
  t.test(`notOk diagnostic message`, (t) => {
    const getMessage = notOkDiagnosticMessage({ theme });

    t.eq(
      getMessage({ actual: 'foo' }),
      `expected <emphasis>"falsy"</emphasis> but got <emphasis>"foo"</emphasis>`
    );

    t.eq(
      getMessage({ actual: {} }),
      `expected <emphasis>"falsy"</emphasis> but got <emphasis>{}</emphasis>`
    );

    t.eq(
      getMessage({ actual: [] }),
      `expected <emphasis>"falsy"</emphasis> but got <emphasis>[]</emphasis>`
    );
  });

  t.test(`fail diagnostic message`, (t) => {
    const getMessage = failDiagnosticMessage({ theme });
    t.eq(
      getMessage({ description: 'should not get here' }),
      `expected <emphasis>fail</emphasis> not to be called, but was called as <emphasis>"should not get here"</emphasis>`
    );
  });

  t.test(`notEqual diagnostic message`, (t) => {
    const getMessage = notEqualDiagnosticMessage({ theme });
    t.eq(
      getMessage(),
      `expected the arguments <emphasis>not to be equivalent</emphasis> but they were`
    );
  });

  t.test(`is diagnostic message`, (t) => {
    const getMessage = isDiagnosticMessage({ theme });
    t.eq(
      getMessage(),
      `expected <emphasis>references to be the same</emphasis> but they were not`
    );
  });

  t.test(`isNot diagnostic message`, (t) => {
    const getMessage = isNotDiagnosticMessage({ theme });
    t.eq(
      getMessage(),
      `expected <emphasis>references not to be the same</emphasis> but they were`
    );
  });

  t.skip(`throws diagnostic message`, (t) => {});

  t.skip(`equal diagnostic message`, (t) => {
    // todo
  });
});
