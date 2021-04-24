const isNode = typeof process !== 'undefined';

export const flatDiagnostic = ({pass, description, ...rest}) => rest;

export const defaultSerializer = (value) => typeof value === 'symbol' ? value.toString() : JSON.stringify(value);

export const defaultLogger = (value) => console.log(value);

export const filter = (predicate) => async function* (stream) {
    for await (const item of stream) {
        if (predicate(item)) {
            yield item;
        }
    }
};

export const isFailing = (message) => message.type === 'ASSERTION' && !message.data.pass;

export const eventuallySetExitCode = (message) => {
    if (isNode && isFailing(message)) {
        process.exitCode = 1;
    }
};

