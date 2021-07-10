const { test } = require('zora');
const { isEven } = require('../../src/index.js');

test(`isEven`, (t) => {
  t.eq(isEven(1), true);
  t.eq(isEven(2), true);
});
