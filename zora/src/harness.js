import { Assert, createAssert } from './test.js';

export const createHarness = ({ onlyMode = false } = {}) => {
  const onNewTest;
  const tests = new Repeater((push, stop) => {
    onNewTest = push;
    process.on('beforeExit', async (code) => {
      await stop()
      process.exit(0)
    });
  });


  // WARNING if the "onlyMode is passed to any harness, all the harnesses will be affected.
  // However, we do not expect multiple harnesses to be used in the same process
  if (onlyMode) {
    const { skip, test } = Assert;
    Assert.test = skip;
    Assert.only = test;
  }

  const { test, skip, only } = createAssert({
    onResult: (test) => onNewTest(test),
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
  for await (const test of tests) {
    yield* test;
  }
}
