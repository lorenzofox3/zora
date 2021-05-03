import * as colors from 'colorette';
import { compose } from '../utils.js';
import { bold, underline } from 'colorette';

const leftPad = (string = '') => string.padStart(string.length + 1);
const rightPad = (string = '') => string.padEnd(string.length + 1);

const pad = compose([leftPad, rightPad]);

export const createTheme = ({
  bgError = colors.bgRedBright,
  bgSuccess = colors.bgGreenBright,
  bgSkip = colors.bgYellowBright,
  disableFont = colors.gray,
  badgeFont = colors.whiteBright,
  adornerFont = colors.cyan,
} = {}) => ({
  errorBadge: compose([bgError, badgeFont, pad]),
  successBadge: compose([bgSuccess, badgeFont, pad]),
  skipBadge: compose([bgSkip, badgeFont, pad]),
  disable: compose([disableFont, pad]),
  header: compose([bold, rightPad]),
  adorner: compose([adornerFont, pad]),
});
