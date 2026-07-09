import { styleText } from 'node:util';
import { compose } from '../utils.js';
import { withMargin } from './utils.js';

const bold = (s) => styleText('bold', s);
const underline = (s) => styleText('underline', s);
const bgRed = (s) => styleText('bgRed', s);
const bgGreen = (s) => styleText('bgGreen', s);
const bgYellow = (s) => styleText('bgYellow', s);
const gray = (s) => styleText('gray', s);
const whiteBright = (s) => styleText('whiteBright', s);
const cyan = (s) => styleText('cyan', s);

const badge = (fn) => compose([fn, bold, withMargin, String]);

export const createTheme = ({
  bgError = bgRed,
  bgSuccess = bgGreen,
  bgSkip = bgYellow,
  disableFont = gray,
  badgeFont = whiteBright,
  adornerFont = cyan,
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
