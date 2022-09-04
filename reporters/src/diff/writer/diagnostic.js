import {
  okDiagnostic,
  notOkDiagnostic,
  failDiagnostic,
  notEqualDiagnostic,
  isDiagnostic,
  isNotDiagnostic,
  throwsDiagnostic,
  equalDiagnostic,
  timeoutDiagnostic,
} from '../diagnostic/index.js';

export default ({ theme }) => {
  const operators = {
    ok: okDiagnostic(theme),
    notOk: notOkDiagnostic(theme),
    fail: failDiagnostic(theme),
    notEqual: notEqualDiagnostic(theme),
    is: isDiagnostic(theme),
    isNot: isNotDiagnostic(theme),
    throws: throwsDiagnostic(theme),
    equal: equalDiagnostic(theme),
    timeout: timeoutDiagnostic(theme),
  };

  const unknown = ({ operator }) =>
    `unknown operator ${theme.emphasis(operator)}`;

  return (diag) => operators[diag.operator]?.(diag) ?? unknown(diag);
};
