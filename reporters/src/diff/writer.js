import { compose, defaultLogger } from '../utils.js';
import { createTheme } from './theme.js';
import { leftPad, withMargin } from './utils.js';
import { Operator } from '../../../assert/src/utils.js';
import { isNot } from '../../../assert/src/assert.js';

const hasSome = (label) => (counter) => counter[label] > 0;
const hasFailure = hasSome('failure');
const hasSkip = hasSome('skip');

export const createWriter = ({
  log = defaultLogger,
  theme = createTheme(),
} = {}) => {
  const print = compose([log, leftPad(2)]);

  const diagnostics = getDiagnosticMessage({ theme });

  const printDiagnostic = (diag) => {
    const { operator } = diag;
    print('');
    const operatorString = theme.operator(`[${operator}]`);
    print(`${operatorString} ${diagnostics(diag)}`);

    // print(
    //   `${operatorString} expected "${theme.emphasis(
    //     expected
    //   )}" but got "${theme.emphasis(actual)}"`
    // );
  };

  const printSummary = ({ success, skip, failure, total }) => {
    print('');
    const headerLabel = `TOTAL:  ${total}`;
    const length = String(total).length + 2;
    const padNumber = (number) => String(number).padStart(length);
    const successLabel = `PASS:${padNumber(success)}`;
    const failLabel = `FAIL:${padNumber(failure)}`;
    const skipLabel = `SKIP:${padNumber(skip)}`;

    print(theme.header(headerLabel));
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

  const printLocation = (at) => print(`${theme.light('at')}: ${at}`);

  const printTestPath = (stack) => {
    print('');
    const testPath = [...stack];
    const current = testPath.pop();
    print(
      theme.header(
        [...testPath, theme.emphasis(current)].join(
          theme.adorner(withMargin('>'))
        )
      )
    );
  };

  return {
    printDiagnostic,
    print,
    printSummary,
    printTestPath,
    printLocation,
  };
};

export const getDiagnosticMessage = ({ theme }) => {
  const operators = {
    [Operator.OK]: ({ actual }) =>
      `expected ${theme.emphasis('"truthy"')} but got ${theme.emphasis(
        actual === '' ? '""' : actual
      )}`,
    [Operator.NOT_OK]: ({ actual }) =>
      `expected ${theme.emphasis('"falsy"')} but got ${theme.emphasis(
        JSON.stringify(actual)
      )}`,
    [Operator.FAIL]: ({ description }) =>
      `expected ${theme.emphasis(
        'fail'
      )} not to be called, but was called as ${theme.emphasis(
        JSON.stringify(description)
      )}`,
    [Operator.NOT_EQUAL]: () =>
      `expected the arguments ${theme.emphasis(
        'not to be equivalent'
      )} but they were`,
    [Operator.IS]: () =>
      `expected ${theme.emphasis(
        'references to be the same'
      )} but they were not`,
    [Operator.IS_NOT]: () =>
      `expected ${theme.emphasis(
        'references not to be the same'
      )} but they were`,
    // [Operator.THROWS]:
  };

  const unknown = ({ operator }) =>
    `unknown operator ${theme.emphasis(operator)}`;

  return (diag) => operators[diag.operator]?.(diag) ?? unknown(diag);
};

export const getSummaryMessage = ({ theme }) => {
  return (counter) => {};
};
