import { Assert, createAssert } from './test.js';
import { Readable } from 'stream';

export const createHarness = ({ onlyMode = false } = {}) => {
  const tests = new Readable({
    objectMode: true,
    read() {},
  });

  // WARNING if the "onlyMode is passed to any harness, all the harnesses will be affected.
  // However, we do not expect multiple harnesses to be used in the same process
  if (onlyMode) {
    const { skip, test } = Assert;
    Assert.test = skip;
    Assert.only = test;
  }

  const { test, skip, only } = createAssert({
    onResult: (testCase) => tests.push({ testCase: testCase }),
  });

  // for convenience
  test.only = only;
  test.skip = skip;

  return {
    only,
    test,
    skip,
    report({ reporter }) {
      return reporter(createMessageStream(tests));
    },
  };
};

async function* createMessageStream(tests) {
  for await (const { testCase } of tests) {
    yield* testCase;
  }
}
