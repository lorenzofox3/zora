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
