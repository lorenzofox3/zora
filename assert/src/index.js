import { decorateWithLocation } from './utils.js';
import { Assert as AssertPrototype } from './assert.js';

const noop = () => {};

const hook = (onResult) => (assert) =>
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
  const hookOnAssert = hook((item) => {
    const result = decorateWithLocation(item);
    onResult(result);
    return result;
  });

  return hookOnAssert(Object.create(AssertPrototype));
};

export const Assert = AssertPrototype;
