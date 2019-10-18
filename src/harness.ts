import {assert} from './assertion';
import {mochaTapLike, tapeTapLike} from './reporter';
import {TestHarness, TestHarnessConfiguration} from './interfaces';
import {testerLikeProvider, TesterPrototype} from './commons';

export const harnessFactory = ({runOnly = false, indent = false}: TestHarnessConfiguration = {
    runOnly: false,
    indent: false
}): TestHarness => {
    const tests = [];
    const rootOffset = 0;
    const collect = item => tests.push(item);
    const api = assert(collect, rootOffset, runOnly);
    let error = null;

    const factory = testerLikeProvider(Object.assign(api, TesterPrototype, {
        report: async function (reporter) {
            const rep = reporter || (indent ? mochaTapLike : tapeTapLike);
            return rep(this);
        }
    }));

    return Object.defineProperties(factory(tests, Promise.resolve(), rootOffset), {
        error: {
            get() {
                return error;
            },
            set(val) {
                error = val;
            }
        }
    });
};