import { getAssertionLocation } from './utils.js';
import { Assert as AssertPrototype } from './assert.js';

const noop = () => {};

export default (
  { onResult = noop } = {
    onResult: noop,
  },
) => {
  return Object.fromEntries(
    Object.entries(AssertPrototype).map(([methodName, fn]) => {
      const decoratedFn = (...args) => {
        const result = fn(...args);
        if (result.pass === false) {
          const stackTarget = {};
          Error.captureStackTrace(stackTarget, decoratedFn);
          const fullResult = {
            ...result,
            at: getAssertionLocation({ rawStack: stackTarget.stack }),
          };
          onResult(fullResult);
          return fullResult;
        }
        onResult(result);
        return result;
      };
      return [methodName, decoratedFn];
    }),
  );
};

export const Assert = AssertPrototype;
