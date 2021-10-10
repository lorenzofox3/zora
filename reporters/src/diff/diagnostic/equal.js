import { diffChars, diffJson } from 'diff';
import { leftPad, typeAsString } from '../utils.js';
import { EOL } from 'os';
import { compose } from '../../utils.js';

const actualParts = ({ added }) => added !== true;
const expectedParts = ({ removed }) => removed !== true;

const mapActualParts =
  (theme) =>
  ({ value, removed }) =>
    removed ? theme.diffActual(value) : value;

const mapExpectedParts =
  (theme) =>
  ({ value, added }) =>
    added ? theme.diffExpected(value) : value;

export const getDiffCharThemedMessage =
  (theme) =>
  ({ actual, expected }) => {
    const diffs = diffChars(actual, expected);
    return {
      actual: diffs.filter(actualParts).map(mapActualParts(theme)).join(''),
      expected: diffs
        .filter(expectedParts)
        .map(mapExpectedParts(theme))
        .join(''),
    };
  };

const diffStrings = (theme) => {
  const diffChars = getDiffCharThemedMessage(theme);
  return ({ expected, actual }) => {
    const { expected: expectedMessage, actual: actualMessage } = diffChars({
      expected,
      actual,
    });

    return `diff in strings:
  ${theme.errorBadge('- actual')} ${theme.successBadge('+ expected')}

  ${theme.errorBadge('-')} ${actualMessage}
  ${theme.successBadge('+')} ${expectedMessage}`;
  };
};

const diffNumbers =
  (theme) =>
  ({ expected, actual }) =>
    `expected number to be ${theme.successBadge(
      expected
    )} but got ${theme.errorBadge(actual)}`;

const diffBigInts =
  (theme) =>
  ({ expected, actual }) =>
    `expected bigint to be ${theme.successBadge(
      expected
    )} but got ${theme.errorBadge(actual)}`;

const diffDates = (theme) => {
  const diffChars = getDiffCharThemedMessage(theme);
  return ({ expected, actual }) => {
    const { expected: expectedMessage, actual: actualMessage } = diffChars({
      expected: expected.toISOString(),
      actual: actual.toISOString(),
    });

    return `diff in dates:
  ${theme.errorBadge('- actual')} ${theme.successBadge('+ expected')}

  ${theme.errorBadge('-')} ${actualMessage}
  ${theme.successBadge('+')} ${expectedMessage}`;
  };
};

const diffBooleans =
  (theme) =>
  ({ expected, actual }) =>
    `expected boolean to be ${theme.emphasis(
      expected
    )} but got ${theme.emphasis(actual)}`;

export const expandNewLines = (lines) =>
  lines.flatMap((line) => {
    const { value, ...rest } = line;
    return value
      .split(EOL)
      .filter(Boolean)
      .map((newValue) => ({
        ...rest,
        value: newValue,
      }));
  });

export const diffLine = (theme) => (diff) => {
  if (diff.added) {
    return `${theme.successBadge('+')} ${diff.value}`;
  }

  if (diff.removed) {
    return `${theme.errorBadge('-')} ${diff.value}`;
  }

  return leftPad(3, theme.disable(diff.value));
};

const getDiffJSONThemedMessage = (theme) => {
  const getLineDiff = diffLine(theme);
  return ({ actual, expected }) => {
    const diff = diffJson(actual, expected);
    return expandNewLines(diff).map(getLineDiff).map(leftPad(2)).join(EOL);
  };
};

const diffObjects = (theme) => {
  const diffJSON = getDiffJSONThemedMessage(theme);
  return ({ expected, actual }) => `diff in objects:
  ${theme.errorBadge('- actual')} ${theme.successBadge('+ expected')}

${diffJSON({ actual, expected })}`;
};

const getDifferentTypeMessage = (theme) => {
  const printType = compose([theme.emphasis, typeAsString]);

  return ({ actual, expected }) =>
    `expected a ${printType(expected)} but got a ${printType(actual)}`;
};

export default (theme) => {
  const differentTypes = getDifferentTypeMessage(theme);

  const sameTypeDiff = {
    ['number']: diffNumbers(theme),
    ['bigint']: diffBigInts(theme),
    ['string']: diffStrings(theme),
    ['boolean']: diffBooleans(theme),
    ['object']: ({ expected, actual }) => {
      if (expected.constructor === Date) {
        return diffDates(theme)({ expected, actual });
      }
      return diffObjects(theme)({ actual, expected });
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
