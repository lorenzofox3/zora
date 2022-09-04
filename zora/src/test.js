import assertFactory, { Assert } from 'zora-assert';
import {
  assertionMessage,
  errorMessage,
  newTestMessage,
  testEndMessage,
} from 'zora-reporters';
import { findConfigurationValue } from './env.js';

const DEFAULT_TIMEOUT = 5_000;
const defaultOptions = Object.freeze({
  skip: false,
  timeout: findConfigurationValue('ZORA_TIMEOUT') || DEFAULT_TIMEOUT,
});
const noop = () => {};

const isTest = (assertionLike) =>
  assertionLike[Symbol.asyncIterator] !== void 0;

Assert.test = (description, spec, opts = defaultOptions) =>
  test(description, spec, opts);

Assert.skip = (description, spec, opts = defaultOptions) =>
  test(description, spec, { ...opts, skip: true });

Assert.only = () => {
  throw new Error(`Can not use "only" method when not in "run only" mode`);
};

const createTimeoutResult = ({ timeout }) => ({
  pass: false,
  actual: `test takes longer than ${timeout}ms to run`,
  expected: `test takes less than ${timeout}ms to complete`,
  description:
    'The test did no complete on time. refer to https://github.com/lorenzofox3/zora/tree/master/zora#test-timeout for more info',
});

export const test = (description, spec, opts = defaultOptions) => {
  const { skip = false, timeout = DEFAULT_TIMEOUT } = opts;
  const assertions = [];
  let executionTime;
  let done = false;
  let error;

  const onResult = (assertion) => {
    if (done) {
      throw new Error(`test "${description}"
tried to collect an assertion after it has run to its completion.
You might have forgotten to wait for an asynchronous task to complete
------
${spec.toString()}`);
    }

    assertions.push(assertion);
  };

  const specFn = skip
    ? noop
    : function zora_spec_fn() {
        return spec(assertFactory({ onResult }));
      };

  const testRoutine = (async function () {
    try {
      let timeoutId;
      const start = Date.now();
      const result = await Promise.race([
        specFn(),
        new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            onResult(createTimeoutResult({ timeout }));
            resolve();
          }, timeout);
        }),
      ]);
      clearTimeout(timeoutId);
      executionTime = Date.now() - start;
      return result;
    } catch (e) {
      error = e;
    } finally {
      done = true;
    }
  })();

  return Object.assign(testRoutine, {
    [Symbol.asyncIterator]: async function* () {
      yield newTestMessage({ description, skip });
      await testRoutine;
      for (const assertion of assertions) {
        if (isTest(assertion)) {
          yield* assertion;
        } else {
          yield assertionMessage(assertion);
        }
      }

      if (error) {
        yield errorMessage({ error });
      }

      yield testEndMessage({ description, executionTime });
    },
  });
};

export { Assert } from 'zora-assert';

export const createAssert = assertFactory;
