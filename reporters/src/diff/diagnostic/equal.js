import { EOL } from 'node:os';
import { inspect } from 'node:util';

import { diffChars, diffLines } from 'diff';

import { leftPad, typeAsString } from '../utils.js';
import { compose, defaultSerializer } from '../../utils.js';

const actualParts = ({ added }) => added !== true;
const expectedParts = ({ removed }) => removed !== true;
const serializeJSON = (value) =>
  inspect(value, { sorted: true, compact: false });

const mapActualParts =
  ({ diffActual }) =>
  ({ value, removed }) =>
    removed ? diffActual(value) : value;

const mapExpectedParts =
  ({ diffExpected }) =>
  ({ value, added }) =>
    added ? diffExpected(value) : value;

export const getDiffCharThemedMessage = (theme) => {
  return ({ actual, expected }) => {
    const diffs = diffChars(actual, expected);
    return {
      actual: diffs.filter(actualParts).map(mapActualParts(theme)).join(''),
      expected: diffs
        .filter(expectedParts)
        .map(mapExpectedParts(theme))
        .join(''),
    };
  };
};

const diffMultiLineStrings = (theme) => {};

const diffSingleLineStrings = (theme) => {
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
  ({ successBadge, errorBadge }) =>
  ({ expected, actual }) =>
    `expected number to be ${successBadge(expected)} but got ${errorBadge(
      actual
    )}`;

const diffBigInts =
  ({ successBadge, errorBadge }) =>
  ({ expected, actual }) =>
    `expected bigint to be ${successBadge(expected)} but got ${errorBadge(
      actual
    )}`;

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
  ({ emphasis }) =>
  ({ expected, actual }) =>
    `expected boolean to be ${emphasis(expected)} but got ${emphasis(actual)}`;

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

export const getThemedLineDiff =
  ({ successBadge, errorBadge, disable }) =>
  ({ added, removed, value }) => {
    if (added) {
      return `${successBadge('+')} ${value}`;
    }

    if (removed) {
      return `${errorBadge('-')} ${value}`;
    }

    return leftPad(3, disable(value));
  };

const getDiffJSONThemedMessage = (theme) => {
  const getLineDiff = getThemedLineDiff(theme);
  return ({ actual, expected }) => {
    const diff = diffLines(serializeJSON(actual), serializeJSON(expected));
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
    ['string']: diffSingleLineStrings(theme),
    ['boolean']: diffBooleans(theme),
    ['object']: ({ expected, actual }) => {
      if (expected.constructor === Date) {
        return diffDates(theme)({ actual, expected });
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
