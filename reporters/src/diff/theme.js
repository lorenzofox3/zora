import * as colors from 'colorette';
import { compose } from '../utils.js';
import { bold, underline } from 'colorette';
import { withMargin } from './utils.js';

const badge = (fn) => compose([bold, fn, withMargin, String]);

export const createTheme = ({
  bgError = colors.bgRed,
  bgSuccess = colors.bgGreen,
  bgSkip = colors.bgYellow,
  disableFont = colors.gray,
  badgeFont = colors.whiteBright, // might be more readable as colors.black
  adornerFont = colors.cyan,
} = {}) => {
  const success = compose([bgSuccess, badgeFont]);
  const error = compose([bgError, badgeFont]);
  return {
    errorBadge: badge(error),
    successBadge: badge(success),
    skipBadge: badge(compose([bgSkip, badgeFont])),
    disable: compose([disableFont, withMargin]),
    header: bold,
    adorner: adornerFont,
    emphasis: compose([underline, bold]),
    operator: adornerFont,
    light: disableFont,
    diffExpected: success,
    diffActual: error,
  };
};

export const dark = createTheme();

export const light = createTheme();
