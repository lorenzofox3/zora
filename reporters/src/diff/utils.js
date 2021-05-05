import { compose } from '../utils.js';

export const leftPad = (offset, string) => {
  if (string === void 0) {
    return (string) => leftPad(offset, string);
  }
  return string.padStart(string.length + offset);
};

export const rightPad = (offset, string) => {
  if (string === void 0) {
    return (string) => rightPad(offset, string);
  }
  return string.padEnd(string.length + offset);
};

export const withMargin = compose([leftPad(1), rightPad(1)]);
