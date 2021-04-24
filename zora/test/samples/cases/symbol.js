import {test} from '../../../dist/bundle/module.js';

test('symbol tester 1', t => {
    t.equal(Symbol('foo'), Symbol('bar'), 'Symbol foo should equal Symbol bar');
    t.equal({symbol: Symbol('foo')}, {symbol: Symbol('bar')}, 'Property Symbol foo should equal Symbol bar');
});
