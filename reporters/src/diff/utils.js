import { compose } from '../utils.js';

const curry2 = (fn) => (a, b) => {
  if (b === void 0) {
    return (b) => fn(a, b);
  }

  return fn(a, b);
};

export const leftPad = curry2((offset, string) =>
  string.padStart(string.length + offset)
);

export const rightPad = curry2((offset, string) =>
  string.padEnd(string.length + offset)
);

export const withMargin = compose([leftPad(1), rightPad(1)]);

export const typeAsString = (value) => {
  if (typeof value === 'object') {
    return value?.constructor?.name ?? String(value);
  }
  return typeof value;
};
