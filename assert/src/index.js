import { decorateWithLocation } from './utils.js';
import { Assert as AssertPrototype } from './assert.js';

const noop = () => {};

const hookOnAssert = (assert, { onResult }) =>
  Object.fromEntries(
    Object.keys(AssertPrototype).map((methodName) => [
      methodName,
      (...args) => onResult(assert[methodName](...args)),
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

  return hookOnAssert(Object.create(AssertPrototype), {
    onResult: resultCallback,
  });
};

export const Assert = AssertPrototype;
