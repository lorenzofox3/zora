import { diffChars } from 'diff';
import { typeAsString } from '../utils.js';

const actualParts = ({ added }) => added !== true;
const expectedParts = ({ removed }) => removed !== true;

export const getDiffCharThemedMessage = (theme) => {
  const mapActualParts = ({ value, removed }) =>
    removed ? theme.diffActual(value) : value;
  const mapExpectedParts = ({ value, added }) =>
    added ? theme.diffExpected(value) : value;

  return ({ actual, expected }) => {
    const diffs = diffChars(actual, expected);
    return {
      actual: diffs.filter(actualParts).map(mapActualParts).join(''),
      expected: diffs.filter(expectedParts).map(mapExpectedParts).join(''),
    };
  };
};

const getDifferentTypeMessage = (theme) => ({ actual, expected }) =>
  `expected a ${theme.emphasis(
    typeAsString(expected)
  )} but got a ${theme.emphasis(typeAsString(actual))}`;

export const getEqualDiagnosticMessage = (theme) => {
  const diffChars = getDiffCharThemedMessage(theme);
  const differentTypes = getDifferentTypeMessage(theme);

  const sameTypeDiff = {
    ['string']: ({ expected, actual }) => {
      const { expected: expectedMessage, actual: actualMessage } = diffChars({
        expected,
        actual,
      });

      return `diff in strings:
  ${theme.errorBadge('- actual')} ${theme.successBadge('+ expected')}
  
  ${theme.errorBadge('-')} ${actualMessage}
  ${theme.successBadge('+')} ${expectedMessage}`;
    },
  };

  return (diag) => {
    const { actual, expected } = diag;
    const expectedType = typeof expected;
    if (typeof actual !== expectedType) {
      return differentTypes({ actual, expected });
    }

    return (
      sameTypeDiff[expectedType]?.(diag) ??
      `unsupported type ${theme.emphasis(expectedType)}`
    );
  };
};
