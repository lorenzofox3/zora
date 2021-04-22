const filter = (predicate) => async function* (stream) {
    for await (const item of stream) {
        if (predicate(item)) {
            yield item;
        }
    }
};

const filterOutTestEnd = filter(({type}) => type !== 'TEST_END');

const createReporter = ({serialize = JSON.stringify, log = console.log} = {}) => {

};

export default (opts) => {
    
    const reporter = createReporter(opts);
    
    return async (messageStream) => {
        for await (const message of (messageStream)) {
            console.log(message);
        }
    };
};

