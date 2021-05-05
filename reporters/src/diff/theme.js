import * as colors from 'colorette';
import { compose } from '../utils.js';
import { bold, underline } from 'colorette';
import { withMargin } from './utils.js';

const badge = (fn) => compose([fn, withMargin]);

export const createTheme = ({
  bgError = colors.bgRedBright,
  bgSuccess = colors.bgGreenBright,
  bgSkip = colors.bgYellowBright,
  disableFont = colors.gray,
  badgeFont = colors.whiteBright,
  adornerFont = colors.cyan,
} = {}) => ({
  errorBadge: badge(compose([bgError, badgeFont])),
  successBadge: badge(compose([bgSuccess, badgeFont])),
  skipBadge: badge(compose([bgSkip, badgeFont])),
  disable: compose([disableFont, withMargin]),
  header: bold,
  adorner: adornerFont,
  emphasis: compose([underline, bold]),
  operator: adornerFont,
  light: disableFont,
});
