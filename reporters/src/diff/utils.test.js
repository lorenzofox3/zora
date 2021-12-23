import { test } from 'zora';
import { leftPad, rightPad, typeAsString, withMargin } from './utils.js';

test('utils', (t) => {
  t.test(`typeAsString`, (t) => {
    t.test(`literals`, (t) => {
      t.eq(typeAsString('some string'), 'string');
      t.eq(typeAsString(42), 'number');
      t.eq(typeAsString(true), 'boolean');
      t.eq(typeAsString(undefined), 'undefined');
    });

    t.test(`objects`, (t) => {
      t.eq(typeAsString({}), 'Object');
      t.eq(typeAsString([]), 'Array');
      t.eq(typeAsString(new Date()), 'Date');
      t.eq(typeAsString(new Map()), 'Map');
      t.eq(typeAsString(new Set()), 'Set');
      t.eq(typeAsString(new (class Foo {})()), 'Foo');
      t.eq(typeAsString(null), 'null');
    });
  });

  t.test(`left pad`, (t) => {
    t.eq(leftPad(4, 'fo'), '    fo');
    const padTwo = leftPad(2);
    t.eq(padTwo('fo'), '  fo', 'partial application');
    t.eq(padTwo('bar'), '  bar', 'partial application');
  });

  t.test(`right pad`, (t) => {
    t.eq(rightPad(4, 'fo'), 'fo    ');
    const padTwo = rightPad(2);
    t.eq(padTwo('fo'), 'fo  ', 'partial application');
    t.eq(padTwo('bar'), 'bar  ', 'partial application');
  });

  t.test(`with margin`, (t) => {
    t.eq(withMargin('some text'), ' some text ');
  });
});
