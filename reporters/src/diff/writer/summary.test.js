import { test } from 'zora';
import getSummaryMessage from './summary.js';

const theme = new Proxy(
  {},
  {
    get: function (target, prop, receiver) {
      return (val) => `<${prop}>${val}</${prop}>`;
    },
  }
);

test(`summary message`, (t) => {
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
