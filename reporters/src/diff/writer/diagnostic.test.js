import { test } from 'zora';
import { Operator } from '../../../../assert/src/utils.js';
import getDiagnosticMessage from './diagnostic.js';
import getEqualDiagnosticMessage from '../diagnostic/equal.js';

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

    t.test(`expected and actual are booleans`, (t) => {
      t.eq(
        getMessage({ actual: true, expected: false }),
        `expected boolean to be <emphasis>false</emphasis> but got <emphasis>true</emphasis>`
      );
    });

    t.test(`expected and actual are Dates`, (t) => {
      t.eq(
        getMessage({
          actual: new Date(Date.UTC(2021, 4, 1)),
          expected: new Date(Date.UTC(2021, 5, 1)),
        }),
        `diff in dates:
  <errorBadge>- actual</errorBadge> <successBadge>+ expected</successBadge>

  <errorBadge>-</errorBadge> 2021-0<diffActual>5</diffActual>-01T00:00:00.000Z
  <successBadge>+</successBadge> 2021-0<diffExpected>6</diffExpected>-01T00:00:00.000Z`
      );
    });

    t.test(`expected and actual are objects`, (t) => {
      const expected = {
        foo: 'bar',
        nested: {
          answer: 42,
        },
      };
      const actual = {
        foo: 'baz',
        nested: {
          answer: 43,
        },
      };
      t.eq(
        getMessage({ expected, actual }),
        `diff in objects:
  <errorBadge>- actual</errorBadge> <successBadge>+ expected</successBadge>

     <disable>{</disable>
  <errorBadge>-</errorBadge>   "foo": "baz",
  <successBadge>+</successBadge>   "foo": "bar",
     <disable>  "nested": {</disable>
  <errorBadge>-</errorBadge>     "answer": 43
  <successBadge>+</successBadge>     "answer": 42
     <disable>  }</disable>
     <disable>}</disable>`
      );
    });

    t.test(`expected and actual are numbers`, (t) => {
      const expected = 5;
      const actual = 3;
      t.eq(
        getMessage({ expected, actual }),
        `expected number to be <successBadge>5</successBadge> but got <errorBadge>3</errorBadge>`
      );
    });

    t.test(`expected and actual are BigInt's`, (t) => {
      const expected = 5n;
      const actual = 3n;
      t.eq(
        getMessage({ expected, actual }),
        `expected bigint to be <successBadge>5</successBadge> but got <errorBadge>3</errorBadge>`
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

  t.test(`throws diagnostic message`, (t) => {
    t.test(`did not throw`, (t) => {
      t.eq(
        getMessage({ operator: Operator.THROWS }),
        `expected <emphasis>to throw</emphasis> but it did not`
      );
    });

    t.test('throws not matching error', (t) => {
      t.eq(
        getMessage({
          operator: Operator.THROWS,
          actual: 'foo',
          expected: /bar/,
        }),
        `expected the error thrown to match <emphasis>/bar/</emphasis> but it matched <emphasis>foo</emphasis>`
      );
    });
  });

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
  });

  t.test(`timeout diagnostic`, (t) => {
    t.eq(
      getMessage({ operator: 'timeout', actual: 'timeout description' }),
      `timeout description`
    );
  });
});
