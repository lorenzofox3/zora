import {indentedTapReporter, tapReporter} from 'zora-tap-reporter';
import {Reporter} from './interfaces';

//@ts-ignore
export const mochaTapLike: Reporter = indentedTapReporter();
//@ts-ignore
export const tapeTapLike: Reporter = tapReporter();