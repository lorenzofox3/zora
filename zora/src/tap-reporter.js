const filter = (predicate) => async function* (stream) {
    for await (const item of stream) {
        if (predicate(item)) {
            yield item;
        }
    }
};

const filterOutTestEnd = filter(({type}) => type !== 'TEST_END');

export const tapReporter = () => async (messageStream) => {
    for await (const message of (messageStream)) {
        console.log(message);
    }
};

