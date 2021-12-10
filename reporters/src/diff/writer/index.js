import { compose, defaultLogger } from '../../utils.js';
import { createTheme } from '../theme.js';
import { leftPad, withMargin } from '../utils.js';
import getDiagnosticMessage from './diagnostic.js';
import getSummaryMessage from './summary.js';

export const createWriter = ({
  log = defaultLogger,
  theme = createTheme(),
} = {}) => {
  const print = compose([log, leftPad(2)]);

  const diagnostics = getDiagnosticMessage({ theme });
  const summary = getSummaryMessage({ theme });

  const printDiagnostic = (diag) => {
    const { description, operator } = diag;
    print('');
    const operatorString = theme.operator(`[${operator}]`);
    print(description);
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

  const printFailingTestPath = (stack) => {
    print('');
    const testPath = [...stack];
    const current = testPath.pop();
    print(
      `${theme.errorBadge('FAIL')} ${theme.header(
        [...testPath, theme.emphasis(current)].join(
          theme.adorner(withMargin('>'))
        )
      )}`
    );
  };

  return {
    printDiagnostic,
    print,
    printSummary,
    printFailingTestPath,
    printLocation,
  };
};
