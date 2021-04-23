import {isNode} from '../env.js';

const isFailing = (message) => message.type === 'ASSERTION' && !message.data.pass;

export default ({
                    log = defaultLogger,
                    serialize = defaultSerializer
                } = {}) => async (messageStream) => {
    for await (const message of messageStream) {
        if (isFailing(message) && isNode) {
            process.exitCode = 1;
        }
        log(serialize(message));
    }
};
