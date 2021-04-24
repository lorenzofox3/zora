import {defaultLogger, defaultSerializer, eventuallySetExitCode} from './utils.js';

export default ({
                    log = defaultLogger,
                    serialize = defaultSerializer
                } = {}) => async (messageStream) => {
    for await (const message of messageStream) {
        eventuallySetExitCode(message);
        log(serialize(message));
    }
};
