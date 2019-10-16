import {assert, AssertPrototype} from '../../src/assertion.js';

const test = require('tape');

const createAssert = () => {
    const result = [];
    return assert(item => result.push(item), 0);
};

const equalPassingCasesInput = ['foo', 4, {woot: 'bim', foo: {bar: null}}, ['foo', 4, {woot: 'bim', foo: {bar: null}}]];
const equalPassingCasesExpectations = ['foo', 4, {woot: 'bim', foo: {bar: null}}, ['foo', 4, {
    woot: 'bim',
    foo: {bar: null}
}]];

const equalAliases = ['equal', 'equals', 'eq', 'deepEqual'];

for (const alias of equalAliases) {
    test(`${alias} operator: passing cases`, t => {
        t.plan(equalPassingCasesInput.length);
        const a = createAssert();
        for (let i = 0; i < equalPassingCasesInput.length; i++) {
            t.deepEqual(a[alias](equalPassingCasesInput[i], equalPassingCasesExpectations[i]), {
                pass: true,
                actual: equalPassingCasesInput[i],
                expected: equalPassingCasesExpectations[i],
                description: 'should be equivalent',
                operator: 'equal' /* EQUAL */
            });
        }
    });
    test(`${alias} operator: should use custom message`, t => {
        const a = createAssert();
        t.deepEqual(a[alias]('foo', 'foo', 'a foo message').description, 'a foo message');
        t.end();
    });
    test(`${alias} operator: fail on type coercion`, t => {
        const a = createAssert();
        const result = a[alias](1, '1');
        t.equal(result.pass, false, 'test should be marked as failed');
        t.ok(result.at, 'should have a stack trace');
        t.equal(result.actual, 1);
        t.equal(result.expected, '1');
        t.end();
    });
}

const notEqualPassingCasesInput = ['foo', 4, {woot: 'bim', foo: {bar: null}}, ['foo', 4, {
    woot: 'bim',
    foo: {bar: null}
}]];
const notEqualPassingCasesExpectations = ['foov', '4', {woot: 'bim', foo: {bar: undefined}}, ['foo', {
    woot: 'bim',
    foo: {bar: null}
}]];
const notEqualAliases = ['notEqual', 'notEquals', 'notEq', 'notDeepEqual'];

for (const alias of notEqualAliases) {
    test(`${alias} operator: passing cases`, t => {
        t.plan(notEqualPassingCasesInput.length);
        const a = createAssert();
        for (let i = 0; i < notEqualPassingCasesInput.length; i++) {
            t.deepEqual(a[alias](notEqualPassingCasesInput[i], notEqualPassingCasesExpectations[i]), {
                pass: true,
                actual: notEqualPassingCasesInput[i],
                expected: notEqualPassingCasesExpectations[i],
                description: 'should not be equivalent',
                operator: 'notEqual' /* NOT_EQUAL */
            });
        }
    });
    test(`${alias} operator: should use custom message`, t => {
        const a = createAssert();
        t.deepEqual(a[alias]('foo', 'foo', 'a foo message').description, 'a foo message');
        t.end();
    });
    test(`${alias} operator: have a stacktrace on failure`, t => {
        const a = createAssert();
        const result = a[alias]('woot', 'woot');
        t.equal(result.pass, false);
        t.ok(result.at, 'stacktrace should be defined');
        t.end();
    });
}

const isAliases = ['is', 'same'];

for (const alias of isAliases) {
    test(`${alias} operator: should pass on same value`, t => {
        const a = createAssert();
        t.deepEqual(a[alias]('foo', 'foo'), {
            pass: true,
            actual: 'foo',
            expected: 'foo',
            description: 'should be the same',
            operator: 'is' /* IS */
        });
        t.end();
    });
    test(`${alias} operator: should pass on same reference`, t => {
        const ref = {};
        const a = createAssert();
        t.deepEqual(a[alias](ref, ref), {
            pass: true,
            actual: ref,
            expected: ref,
            description: 'should be the same',
            operator: 'is' /* IS */
        });
        t.end();
    });
    test(`${alias} operator: use a different description`, t => {
        const a = createAssert();
        t.deepEqual(a[alias]('foo', 'foo', 'hey hey').description, 'hey hey');
        t.end();
    });
    test(`${alias} operator: should fail on different reference`, t => {
        const a = createAssert();
        const result = a[alias]({}, {});
        t.equal(result.pass, false);
        t.ok(result.at, 'should have stacktrace');
        t.end();
    });
}

const isNot = ['isNot', 'notSame'];

for (const alias of isNot) {
    test(`${alias} operator: should pass on different value`, t => {
        const a = createAssert();
        t.deepEqual(a[alias]('foo', 'fo'), {
            pass: true,
            actual: 'foo',
            expected: 'fo',
            description: 'should not be the same',
            operator: 'isNot' /* IS_NOT */
        });
        t.end();
    });
    test(`${alias} operator: should pass on different reference`, t => {
        const a = createAssert();
        t.deepEqual(a[alias]({}, {}), {
            pass: true,
            actual: {},
            expected: {},
            description: 'should not be the same',
            operator: 'isNot' /* IS_NOT */
        });
        t.end();
    });
    test(`${alias} operator: use a different description`, t => {
        const a = createAssert();
        t.deepEqual(a[alias]('foo', 'foo', 'hey hey').description, 'hey hey');
        t.end();
    });
    test(`${alias} operator: should fail on same reference`, t => {
        const a = createAssert();
        const ref = {};
        const result = a[alias](ref, ref);
        t.equal(result.pass, false);
        t.ok(result.at, 'should have stacktrace');
        t.end();
    });
}
const truthyAliases = ['ok', 'truthy'];
for (const alias of truthyAliases) {
    test(`${alias} operator: pass on truthy value`, t => {
        const a = createAssert();
        const res = a[alias]('foo');
        t.deepEqual(res, {
            pass: true,
            actual: 'foo',
            expected: 'truthy value',
            description: 'should be truthy',
            operator: 'ok' /* OK */
        });
        t.ok(a[alias](';'));
        t.ok(a[alias]({}));
        t.end();
    });
    test(`${alias} operator: should not pass on falsy values`, t => {
        const a = createAssert();
        const res = a[alias]('');
        t.equal(res.pass, false);
        t.ok(res.at, 'should have a stacktrace');
        t.notOk(a[alias](false).pass);
        t.notOk(a[alias](null).pass);
        t.end();
    });
    test(`${alias} operator: with another description`, t => {
        const a = createAssert();
        const res = a[alias]('', 'empty string');
        t.equal(res.description, 'empty string');
        t.end();
    });
}

const falsyAliases = ['notOk', 'falsy'];
for (const alias of falsyAliases) {
    test(`${alias} operator: pass on falsy value`, t => {
        const a = createAssert();
        const res = a[alias]('');
        t.deepEqual(res, {
            pass: true,
            actual: '',
            expected: 'falsy value',
            description: 'should be falsy',
            operator: 'notOk' /* NOT_OK */
        });
        t.ok(a[alias](null));
        t.ok(a[alias](0));
        t.end();
    });
    test(`${alias} operator: should not pass on truthy values`, t => {
        const a = createAssert();
        const res = a[alias]('s');
        t.equal(res.pass, false);
        t.ok(res.at, 'should have a stacktrace');
        t.notOk(a[alias](1).pass);
        t.notOk(a[alias]({}).pass);
        t.end();
    });
    test(`${alias} operator: with another description`, t => {
        const a = createAssert();
        const res = a[alias]('', 'empty string');
        t.equal(res.description, 'empty string');
        t.end();
    });
}

test('fail operator', t => {
    const a = createAssert();
    const res = a.fail();
    t.equal(res.pass, false);
    t.equal(res.actual, 'fail called');
    t.equal(res.expected, 'fail not called');
    t.equal(res.description, 'fail called');
    t.equal(res.operator, 'fail' /* FAIL */);
    t.ok(res.at, 'should have a stacktrace');
    t.end();
});

test('fail operator: custom message assertion', t => {
    const a = createAssert();
    const res = a.fail('oh noooo');
    t.equal(res.description, 'oh noooo');
    t.end();
});

test('throws operator', t => {
    const a = createAssert();
    const {operator, description, pass} = a.throws(() => {
        throw new Error();
    });
    t.equal(operator, 'throws' /* THROWS */, 'should have the operator throws');
    t.equal(description, 'should throw', 'should have the default description');
    t.equal(pass, true, 'should have passed');
    t.end();
});

test('throws operator: change default description', t => {
    const a = createAssert();
    const {operator, description, pass} = a.throws(() => {
        throw new Error();
    }, 'unexepected lack of error');
    t.equal(operator, 'throws' /* THROWS */, 'should have the operator throws');
    t.equal(description, 'unexepected lack of error', 'should have the custom description');
    t.equal(pass, true, 'should have passed');
    t.end();
});

test('throws operator: failure', t => {
    const a = createAssert();
    const {operator, description, pass} = a.throws(() => {
    });
    t.equal(operator, 'throws' /* THROWS */, 'should have the operator throws');
    t.equal(description, 'should throw', 'should have the default description');
    t.equal(pass, false, 'should not have passed');
    t.end();
});

test('throws operator: expected (RegExp)', t => {
    const a = createAssert();
    const error = new Error('Totally expected error');
    const regexp = /^totally/i;
    const {operator, description, pass, expected, actual} = a.throws(() => {
        throw error;
    }, regexp);
    t.equal(operator, 'throws' /* THROWS */, 'should have the operator throws');
    t.equal(description, 'should throw', 'should have the default description');
    t.equal(pass, true, 'should have passed');
    t.equal(expected, '/^totally/i');
    t.equal(actual, error.message);
    t.end();
});

test('throws operator: expected (RegExp, failed)', t => {
    const a = createAssert();
    const error = new Error('Not the expected error');
    const regexp = /^totally/i;
    const {operator, description, pass, expected, actual} = a.throws(() => {
        throw error;
    }, regexp);
    t.equal(operator, 'throws' /* THROWS */, 'should have the operator throws');
    t.equal(description, 'should throw', 'should have the default description');
    t.equal(pass, false, 'should have passed');
    t.equal(expected, '/^totally/i');
    t.equal(actual, error.message);
    t.end();
});

test('throws operator: expected (constructor)', t => {
    const a = createAssert();

    function CustomError() {
    }

    const error = new CustomError();
    const {operator, description, pass, expected, actual} = a.throws(() => {
        throw error;
    }, CustomError);
    t.equal(operator, 'throws' /* THROWS */, 'should have the operator throws');
    t.equal(description, 'should throw', 'should have the default description');
    t.equal(pass, true, 'should have passed');
    t.equal(expected, CustomError);
    t.equal(actual, CustomError);
    t.end();
});

test('throws operator: expected (constructor, failed)', t => {
    const a = createAssert();

    function CustomError() {
    }

    const error = new Error('Plain error');
    const {operator, description, pass, expected, actual} = a.throws(() => {
        throw error;
    }, CustomError);
    t.equal(operator, 'throws' /* THROWS */, 'should have the operator throws');
    t.equal(description, 'should throw', 'should have the default description');
    t.equal(pass, false, 'should have passed');
    t.equal(expected, CustomError);
    t.equal(actual, Error);
    t.end();
});

test('doesNotThrow operator', t => {
    const a = createAssert();
    const {operator, description, pass, expected, actual} = a.doesNotThrow(() => {
    });
    t.equal(operator, 'doesNotThrow' /* DOES_NOT_THROW */, 'should have the operator doesNotThrow');
    t.equal(description, 'should not throw', 'should have the default description');
    t.equal(pass, true, 'should have passed');
    t.equal(expected, 'no thrown error');
    t.equal(actual, undefined);
    t.end();
});

test('doesNotThrow operator: change default description', t => {
    const a = createAssert();
    const {operator, description, pass} = a.doesNotThrow(function () {
    }, 'unexepected error');
    t.equal(operator, 'doesNotThrow' /* DOES_NOT_THROW */, 'should have the operator doesNotThrow');
    t.equal(description, 'unexepected error', 'should have the custom description');
    t.equal(pass, true, 'should have passed');
    t.end();
});

test('doesNotThrow operator: failure', t => {
    const a = createAssert();
    const {operator, description, pass} = a.doesNotThrow(() => {
        throw Error();
    });
    t.equal(operator, 'doesNotThrow' /* DOES_NOT_THROW */, 'should have the operator doesNotThrow');
    t.equal(description, 'should not throw', 'should have the default description');
    t.equal(pass, false, 'should have passed');
    t.end();
});

test('doesNotThrow operator: expected (ignored)', t => {
    const a = createAssert();

    function CustomError() {
    }

    const {operator, description, pass, expected, actual} = a.doesNotThrow(() => {
    }, CustomError);
    t.equal(operator, 'doesNotThrow' /* DOES_NOT_THROW */, 'should have the operator doesNotThrow');
    t.equal(description, 'should not throw', 'should have the default description');
    t.equal(pass, true, 'should have passed');
    t.equal(expected, 'no thrown error');
    t.equal(actual, undefined);
    t.end();
});

test('extend assertion library', t => {
    const result = [];
    const a = assert(item => result.push(item), 0);

    AssertPrototype.isFoo = function (value, description = 'should be "foo"') {
        const result = {
            pass: value === 'foo',
            expected: 'foo',
            actual: value,
            operator: 'isFoo',
            description
        };
        return this.collect(result);
    };

    const r = a.isFoo('foo');

    t.equal(result.length, 1, 'should have collected the assertion');
    t.equal(r.pass, true, 'pass prop should be true');
    t.equal(r.expected, 'foo', 'expected prop should be "foo"');
    t.equal(r.actual, 'foo', 'actual prop should be "foo"');
    t.equal(r.description, 'should be "foo"', 'should have set the description property');
    t.equal(r.operator, 'isFoo', 'should have set the operator');
    t.end();
});

test('extend assertion library with failing assertion: should set the "at" property', t => {
    const result = [];
    const a = assert(item => result.push(item), 0);

    AssertPrototype.isFoo = function (value, description = 'should be "foo"') {
        const result = {
            pass: value === 'foo',
            expected: 'foo',
            actual: value,
            operator: 'isFoo',
            description
        };
        return this.collect(result);
    };

    const r = a.isFoo('blah', 'woot');

    t.equal(result.length, 1, 'should have collected the assertion');
    t.equal(r.pass, false, 'pass prop should be false');
    t.equal(r.expected, 'foo', 'expected prop should be "foo"');
    t.equal(r.actual, 'blah', 'actual prop should be "foo"');
    t.equal(r.description, 'woot', 'should have set the description property');
    t.equal(r.operator, 'isFoo', 'should have set the operator');
    t.ok(r.at, 'stack trace should have been set');
    t.end();
});


