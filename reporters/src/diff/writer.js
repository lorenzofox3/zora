import { compose, defaultLogger } from '../utils.js';
import { createTheme } from './theme.js';
import { leftPad, typeAsString, withMargin } from './utils.js';
import { Operator } from '../../../assert/src/utils.js';
import { diffChars } from 'diff';
import { getEqualDiagnosticMessage } from './diagnostic/equal.js';

const hasSome = (label) => (counter) => counter[label] > 0;
const hasFailure = hasSome('failure');
const hasSkip = hasSome('skip');

export const createWriter = ({
  log = defaultLogger,
  theme = createTheme(),
} = {}) => {
  const print = compose([log, leftPad(2)]);

  const diagnostics = getDiagnosticMessage({ theme });
  const summary = getSummaryMessage({ theme });

  const printDiagnostic = (diag) => {
    const { operator } = diag;
    print('');
    const operatorString = theme.operator(`[${operator}]`);
    print(`${operatorString} ${diagnostics(diag)}`);
  };

  const printSummary = (counter) => {
    print('');
    print(summary.total(counter));
    print(summary.pass(counter));
    print(summary.fail(counter));
    print(summary.skip(counter));
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

const getPad = ({ total }) => (number) =>
  String(number).padStart(String(total).length + 2);

export const getSummaryMessage = ({ theme }) => {
  return {
    fail(counter) {
      const padNumber = getPad(counter);
      const label = `FAIL:${padNumber(counter.failure)}`;
      return hasFailure(counter)
        ? theme.errorBadge(label)
        : theme.disable(label);
    },
    pass(counter) {
      const padNumber = getPad(counter);
      const label = `PASS:${padNumber(counter.success)}`;
      return hasFailure(counter)
        ? theme.disable(label)
        : theme.successBadge(label);
    },
    skip(counter) {
      const padNumber = getPad(counter);
      const label = `SKIP:${padNumber(counter.skip)}`;
      return hasSkip(counter) ? theme.skipBadge(label) : theme.disable(label);
    },
    total(counter) {
      return theme.header(`TOTAL:  ${counter.total}`);
    },
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
    [Operator.THROWS]: () => {
      throw new Error('not implemented yet');
    },
    [Operator.EQUAL]: getEqualDiagnosticMessage(theme),
  };

  const unknown = ({ operator }) =>
    `unknown operator ${theme.emphasis(operator)}`;

  return (diag) => operators[diag.operator]?.(diag) ?? unknown(diag);
};
