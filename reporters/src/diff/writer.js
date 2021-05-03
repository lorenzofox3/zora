import { defaultLogger } from '../utils.js';
import { createTheme } from './theme.js';

const hasSome = (label) => (counter) => counter[label] > 0;
const hasFailure = hasSome('failure');
const hasSkip = hasSome('skip');

export const createWriter = ({
  log = defaultLogger,
  theme = createTheme(),
} = {}) => {
  const printDiagnostic = ({ expected, actual }) => {
    if (typeof expected !== typeof actual) {
      print(
        `expected value of type "${type(expected)}" but got ${type(actual)}`
      );
    }

    print(`expected ${expected} but got ${actual}`);
  };

  const print = (val) => {
    log(val);
  };

  const printSummary = ({ success, skip, failure, total }) => {
    print('');
    print(theme.header(`TOTAL:  ${total}`));
    const successLabel = `PASS:  ${success}`;
    const failLabel = `FAIL:  ${failure}`;
    const skipLabel = `SKIP:  ${skip}`;
    print(
      hasFailure({ failure })
        ? theme.disable(successLabel)
        : theme.successBadge(successLabel)
    );
    print(
      hasFailure({ failure })
        ? theme.errorBadge(failLabel)
        : theme.disable(failLabel)
    );
    print(
      hasSkip({ skip }) ? theme.skipBadge(skipLabel) : theme.disable(skipLabel)
    );
    print('');
  };
  const printTestPath = (stack) => {
    print('');
    print(theme.header(['', ...stack].join(theme.adorner('>'))));
  };

  return {
    printDiagnostic,
    print,
    printSummary,
    printTestPath,
  };
};

const type = (value) => {
  if (typeof value === 'object') {
    if (value === null) {
      return null;
    }
    return value.constructor.name;
  }

  return typeof value;
};
