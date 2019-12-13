import {harnessFactory as createHarness} from '../../src/harness.js';

const test = require('tape');

const wait = (time = 0) => new Promise(resolve => {
    setTimeout(() => resolve(), time);
});

const checkMessageStream = async (t, harness, expectedMessageStream) => {
    const messages = [];
    for await (const m of harness) {
        // remove moving part -> execution time
        if (m.data.executionTime !== undefined) {
            m.data = {...m.data, executionTime: '{TIME}'};
        }
        // test harness finished
        if (m.type === 'TEST_END' /* TEST_END */ && m.offset === 0) {
            m.data = {executionTime: '{TIME}'};
        }

        messages.push(m);
    }
    t.deepEqual(messages, expectedMessageStream, 'should have the list of messages');
};

test('test harness with basic sub tests', async (t) => {
    const harness = createHarness();
    const {test} = harness;
    test('some tester', t => {
        t.equal(2, 2, 'equality');
        t.ok(true, 'a second assertion');
    });
    test('some second tester', t => {
        t.equal(2, 2, 'equality in second tester');
        t.ok(true, 'and another one');
    });
    await checkMessageStream(t, harness, [{type: 'TEST_START', data: {description: 'some tester'}, offset: 0}, {
        type: 'ASSERTION',
        data: {pass: true, actual: 2, expected: 2, description: 'equality', operator: 'equal'},
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {
            pass: true,
            actual: true,
            expected: 'truthy value',
            description: 'a second assertion',
            operator: 'ok'
        },
        offset: 1
    }, {
        type: 'TEST_END',
        data: {
            description: 'some tester',
            pass: true,
            executionTime: '{TIME}'
        },
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {
            description: 'some tester',
            pass: true,
            executionTime: '{TIME}'
        },
        offset: 0
    }, {type: 'TEST_START', data: {description: 'some second tester'}, offset: 0}, {
        type: 'ASSERTION',
        data: {pass: true, actual: 2, expected: 2, description: 'equality in second tester', operator: 'equal'},
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {
            pass: true,
            actual: true,
            expected: 'truthy value',
            description: 'and another one',
            operator: 'ok'

        },
        offset: 1
    }, {
        type: 'TEST_END',
        data: {
            description: 'some second tester',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {
            description: 'some second tester',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 0
    }, {type: 'TEST_END', data: {executionTime: '{TIME}'}, offset: 0}]);
    t.end();
});

test('test harness with async sub tests: should stream in the declared order', async (t) => {
    const harness = createHarness();
    const {test} = harness;
    test('some longer tester first', async (t) => {
        t.equal(2, 2, 'equality');
        await wait(100);
        t.ok(true, 'a second assertion');
    });
    test('some faster tester second', async (t) => {
        t.equal(2, 2, 'equality in second tester');
        await wait(50);
        t.ok(true, 'and another one');
    });
    await checkMessageStream(t, harness, [{
        type: 'TEST_START',
        data: {description: 'some longer tester first'},
        offset: 0
    }, {
        type: 'ASSERTION',
        data: {pass: true, actual: 2, expected: 2, description: 'equality', operator: 'equal'},
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {
            pass: true,
            actual: true,
            expected: 'truthy value',
            description: 'a second assertion',
            operator: 'ok'

        },
        offset: 1
    }, {
        type: 'TEST_END',
        data: {
            description: 'some longer tester first',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {
            description: 'some longer tester first',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 0
    }, {type: 'TEST_START', data: {description: 'some faster tester second'}, offset: 0}, {
        type: 'ASSERTION',
        data: {pass: true, actual: 2, expected: 2, description: 'equality in second tester', operator: 'equal'},
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {
            pass: true,
            actual: true,
            expected: 'truthy value',
            description: 'and another one',
            operator: 'ok'

        },
        offset: 1
    }, {
        type: 'TEST_END',
        data: {
            description: 'some faster tester second',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {
            description: 'some faster tester second',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 0
    }, {type: 'TEST_END', data: {executionTime: '{TIME}'}, offset: 0}]);
    t.end();
});

test('test harness with nested sub tests', async (t) => {
    const harness = createHarness();
    const {test} = harness;
    test('some first root', t => {
        t.equal(2, 2, 'before');
        t.test('inside', t => {
            t.ok(true, 'before inside');
            t.test('deep', t => {
                t.ok(true, 'deeply');
            });
            t.ok('after deep');
        });
        t.ok(true, 'after');
    });
    test('some other tester', async (t) => {
        t.ok(true, 'just to check');
    });
    await checkMessageStream(t, harness, [{
        type: 'TEST_START',
        data: {description: 'some first root'},
        offset: 0
    }, {
        type: 'ASSERTION',
        data: {pass: true, actual: 2, expected: 2, description: 'before', operator: 'equal'},
        offset: 1
    }, {type: 'TEST_START', data: {description: 'inside'}, offset: 1}, {
        type: 'ASSERTION',
        data: {pass: true, actual: true, expected: 'truthy value', description: 'before inside', operator: 'ok'},
        offset: 2
    }, {type: 'TEST_START', data: {description: 'deep'}, offset: 2}, {
        type: 'ASSERTION',
        data: {pass: true, actual: true, expected: 'truthy value', description: 'deeply', operator: 'ok'},
        offset: 3
    }, {
        type: 'TEST_END',
        data: {description: 'deep', pass: true, executionTime: '{TIME}'},
        offset: 3
    }, {
        type: 'ASSERTION',
        data: {description: 'deep', pass: true, executionTime: '{TIME}'},
        offset: 2
    }, {
        type: 'ASSERTION',
        data: {
            pass: true,
            actual: 'after deep',
            expected: 'truthy value',
            description: 'should be truthy',
            operator: 'ok'

        },
        offset: 2
    }, {
        type: 'TEST_END',
        data: {
            description: 'inside',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 2
    }, {
        type: 'ASSERTION',
        data: {
            description: 'inside',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {pass: true, actual: true, expected: 'truthy value', description: 'after', operator: 'ok'},
        offset: 1
    }, {
        type: 'TEST_END',
        data: {
            description: 'some first root',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {
            description: 'some first root',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 0
    }, {type: 'TEST_START', data: {description: 'some other tester'}, offset: 0}, {
        type: 'ASSERTION',
        data: {pass: true, actual: true, expected: 'truthy value', description: 'just to check', operator: 'ok'},
        offset: 1
    }, {
        type: 'TEST_END',
        data: {
            description: 'some other tester',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {
            description: 'some other tester',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 0
    }, {type: 'TEST_END', data: {executionTime: '{TIME}'}, offset: 0}]);
    t.end();
});

test('test harness with nested async sub test: should stream in the declared order', async (t) => {
    const harness = createHarness();
    const {test} = harness;
    test('keep parallel', async (t) => {
        let counter = 0;
        t.test('a first tester', async (t) => {
            t.ok(true, 'inside first');
            await wait(50);
            counter++;
        });
        t.test('check counter', t => {
            t.equal(counter, 0, 'should find the not updated value');
        });
    });
    test('control flow', async (t) => {
        let counter = 0;
        await t.test('a first tester', async (t) => {
            t.ok(true, 'inside first');
            await wait(50);
            counter++;
        });
        t.test('check counter', t => {
            t.equal(counter, 1, 'should have the updated value');
        });
    });
    await checkMessageStream(t, harness, [{type: 'TEST_START', data: {description: 'keep parallel'}, offset: 0}, {
        type: 'TEST_START',
        data: {description: 'a first tester'},
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {pass: true, actual: true, expected: 'truthy value', description: 'inside first', operator: 'ok'},
        offset: 2
    }, {
        type: 'TEST_END',
        data: {
            description: 'a first tester',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 2
    }, {
        type: 'ASSERTION',
        data: {
            description: 'a first tester',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 1
    }, {type: 'TEST_START', data: {description: 'check counter'}, offset: 1}, {
        type: 'ASSERTION',
        data: {
            pass: true,
            actual: 0,
            expected: 0,
            description: 'should find the not updated value',
            operator: 'equal'

        },
        offset: 2
    }, {
        type: 'TEST_END',
        data: {
            description: 'check counter',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 2
    }, {
        type: 'ASSERTION',
        data: {
            description: 'check counter',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 1
    }, {
        type: 'TEST_END',
        data: {
            description: 'keep parallel',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {
            description: 'keep parallel',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 0
    }, {type: 'TEST_START', data: {description: 'control flow'}, offset: 0}, {
        type: 'TEST_START',
        data: {description: 'a first tester'},
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {pass: true, actual: true, expected: 'truthy value', description: 'inside first', operator: 'ok'},
        offset: 2
    }, {
        type: 'TEST_END',
        data: {
            description: 'a first tester',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 2
    }, {
        type: 'ASSERTION',
        data: {
            description: 'a first tester',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 1
    }, {type: 'TEST_START', data: {description: 'check counter'}, offset: 1}, {
        type: 'ASSERTION',
        data: {
            pass: true,
            actual: 1,
            expected: 1,
            description: 'should have the updated value',
            operator: 'equal'

        },
        offset: 2
    }, {
        type: 'TEST_END',
        data: {
            description: 'check counter',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 2
    }, {
        type: 'ASSERTION',
        data: {
            description: 'check counter',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 1
    }, {
        type: 'TEST_END',
        data: {
            description: 'control flow',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 1
    }, {
        type: 'ASSERTION',
        data: {
            description: 'control flow',
            pass: true,
            executionTime: '{TIME}'

        },
        offset: 0
    }, {type: 'TEST_END', data: {executionTime: '{TIME}'}, offset: 0}]);
    t.end();
});

test('test harness in bailout: should end the stream', async (t) => {
    let error = null;
    const harness = createHarness();
    const {test} = harness;
    test('will throw', t => {
        t.ok('should be seen');
        error = new Error('Oh no!');
        throw error;
    });
    await checkMessageStream(t, harness, [
        {type: 'TEST_START', data: {description: 'will throw'}, offset: 0},
        {
            type: 'ASSERTION',
            data: {
                pass: true,
                actual: 'should be seen',
                expected: 'truthy value',
                description: 'should be truthy',
                operator: 'ok'

            },
            offset: 1
        },
        {type: 'BAIL_OUT', data: error, offset: 1}
    ]);
    t.ok(error, 'error should be defined');
    t.end();
});

test('test harness with a nested bailout: should end the stream', async (t) => {
    let error = null;
    const harness = createHarness();
    const {test} = harness;
    test('will throw', t => {
        t.ok(true, 'should be seen');
        t.test('inside', t => {
            t.ok(true, 'assert inside');
            error = new Error('Oh no!');
            throw error;
        });
    });
    await checkMessageStream(t, harness, [{type: 'TEST_START', data: {description: 'will throw'}, offset: 0}, {
        type: 'ASSERTION',
        data: {
            pass: true,
            actual: true,
            expected: 'truthy value',
            description: 'should be seen',
            operator: 'ok'

        },
        offset: 1
    },
        {type: 'TEST_START', data: {description: 'inside'}, offset: 1},
        {
            type: 'ASSERTION',
            data: {
                pass: true,
                actual: true,
                expected: 'truthy value',
                description: 'assert inside',
                operator: 'ok'

            },
            offset: 2
        }, {type: 'BAIL_OUT', data: error, offset: 2}]);
    t.ok(error, 'error should be defined');
    t.end();
});
