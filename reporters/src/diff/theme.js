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
