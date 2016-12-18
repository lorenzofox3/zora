import plan from 'tape';
import assert from '../lib/assertions';
import test from '../lib/test';

function testFunc () {

  function fakeTest () {
    return {
      addAssertion(item){
        this.assertions.push(item);
      },
      assertions: []
    };
  }

  plan('ok operator', t=> {
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass} = a.ok('true');
    t.equal(operator, 'ok', 'should have the operator ok');
    t.equal(message, 'should be truthy', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  plan('ok operator: change message', t=> {
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass, expected, actual} = a.ok(0, 'not default!');
    t.equal(operator, 'ok', 'should have the operator ok');
    t.equal(message, 'not default!', 'should not have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(expected, 'truthy');
    t.equal(actual, 0, 'should have provided the acual value');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  plan('deepEqual operator', t=> {
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass} = a.deepEqual({foo: {bar: 'bar'}}, {foo: {bar: 'bar'}});
    t.equal(operator, 'deepEqual', 'should have the operator deepEqual');
    t.equal(message, 'should be equivalent', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  plan('deepEqual operator: change message', t=> {
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass, expected, actual} = a.deepEqual({foo: 'bar'}, {blah: 'bar'}, 'woot woot');
    t.equal(operator, 'deepEqual', 'should have the operator deepEqual');
    t.equal(message, 'woot woot', 'should not have the default message');
    t.equal(pass, false, 'should not have passed');
    t.deepEqual(actual, {foo: 'bar'});
    t.deepEqual(expected, {blah: 'bar'});
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  plan('equal operator', t=> {
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass} = a.equal('foo', 'foo');
    t.equal(operator, 'equal', 'should have the operator equal');
    t.equal(message, 'should be equal', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  plan('equal operator: change default message', t=> {
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass} = a.equal({foo: 'foo'}, {foo: 'foo'}, 'woot ip');
    t.equal(operator, 'equal', 'should have the operator equal');
    t.equal(message, 'woot ip', 'should have the custom message');
    t.equal(pass, false, 'should not have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  plan('notOk operator', t=> {
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass} = a.notOk(false);
    t.equal(operator, 'notOk', 'should have the operator notOk');
    t.equal(message, 'should not be truthy', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  plan('notOk operator: change message', t=> {
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass, expected, actual} = a.notOk(1, 'not default!');
    t.equal(operator, 'notOk', 'should have the operator notOk');
    t.equal(message, 'not default!', 'should not have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(expected, 'falsy');
    t.equal(actual, 1, 'should have provided the acual value');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  plan('notDeepEqual operator', t=> {
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass} = a.notDeepEqual({foo: {bar: 'blah'}}, {foo: {bar: 'bar'}});
    t.equal(operator, 'notDeepEqual', 'should have the operator notDeepEqual');
    t.equal(message, 'should not be equivalent', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  plan('notDeepEqual operator: change message', t=> {
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass, expected, actual} = a.notDeepEqual({foo: {bar: 'bar'}}, {foo: {bar: 'bar'}}, 'woot woot');
    t.equal(operator, 'notDeepEqual', 'should have the operator notDeepEqual');
    t.equal(message, 'woot woot', 'should not have the default message');
    t.equal(pass, false, 'should not have passed');
    t.deepEqual(actual, {foo: {bar: 'bar'}});
    t.deepEqual(expected, {foo: {bar: 'bar'}});
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  plan('notEqual operator', t=> {
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass} = a.notEqual({foo: 'bar'}, {foo: 'bar'});
    t.equal(operator, 'notEqual', 'should have the operator notEqual');
    t.equal(message, 'should not be equal', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  plan('notEqual operator: change default message', t=> {
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass} = a.notEqual('foo', 'foo', 'blah');
    t.equal(operator, 'notEqual', 'should have the operator notEqual');
    t.equal(message, 'blah', 'should have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  plan('fail',t=>{
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass} = a.fail();
    t.equal(operator, 'fail', 'should have the operator fail');
    t.equal(message, 'fail called', 'should have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  plan('fail: change default message',t=>{
    const tp = test({});
    const a = assert(tp);
    const {operator, message, pass} = a.fail('should not get here');
    t.equal(operator, 'fail', 'should have the operator fail');
    t.equal(message, 'should not get here', 'should have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

}

export default testFunc;
