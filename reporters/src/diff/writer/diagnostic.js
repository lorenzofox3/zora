import { Operator } from '../../../../assert/src/utils.js';
import {
  okDiagnostic,
  notOkDiagnostic,
  failDiagnostic,
  notEqualDiagnostic,
  isDiagnostic,
  isNotDiagnostic,
  throwsDiagnostic,
  equalDiagnostic,
} from '../diagnostic/index.js';

export default ({ theme }) => {
  const operators = {
    [Operator.OK]: okDiagnostic(theme),
    [Operator.NOT_OK]: notOkDiagnostic(theme),
    [Operator.FAIL]: failDiagnostic(theme),
    [Operator.NOT_EQUAL]: notEqualDiagnostic(theme),
    [Operator.IS]: isDiagnostic(theme),
    [Operator.IS_NOT]: isNotDiagnostic(theme),
    [Operator.THROWS]: throwsDiagnostic(theme),
    [Operator.EQUAL]: equalDiagnostic(theme),
  };

  const unknown = ({ operator }) =>
    `unknown operator ${theme.emphasis(operator)}`;

  return (diag) => operators[diag.operator]?.(diag) ?? unknown(diag);
};
