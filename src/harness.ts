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

    const Prototype = Object.assign(api, TesterPrototype, {
        report: async function (reporter) {
            const rep = reporter || (indent ? mochaTapLike : tapeTapLike);
            return rep(this);
        }
    });

    const factory = testerLikeProvider(Prototype);

    return Object.create(factory(tests, Promise.resolve(), rootOffset), {
        error: {
            get() {
                return error;
            },
            set(val) {
                error = val;
            }
        }
    })
};
