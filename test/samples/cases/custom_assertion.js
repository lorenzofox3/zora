import {test} from '../../../dist/bundle/module.js';

const customAssert = spec => t => {
    return spec(Object.assign(t, {
        isFoo(value, description = 'should be "foo"') {
            return this.collect({
                pass: value === 'foo',
                expected: 'foo',
                actual: value,
                operator: 'isFoo',
                description,
                other: 'property'
            });
        }
    }));
};

test('tester 1', customAssert(t => {
    t.equal('foo', 'foo', 'foo should equal foo');
    t.isFoo('blah');
}));
