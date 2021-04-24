import { decorateWithLocation } from './utils.js';
import { Assert as AssertPrototype } from './assert.js';

const noop = () => {};

const bindAssert = (assert, { onResult }) =>
  Object.fromEntries(
    [...Object.keys(AssertPrototype)].map((methodName) => [
      methodName,
      function (...args) {
        return onResult(assert[methodName](...args));
      },
    ])
  );

export default (
  { onResult = noop } = {
    onResult: noop,
  }
) => {
  const resultCallback = (item) => {
    const result = decorateWithLocation(item);
    onResult(result);
    return result;
  };

  return bindAssert(Object.create(AssertPrototype), {
    onResult: resultCallback,
  });
};

export const Assert = AssertPrototype;
