import plan from 'tape';
import test from '../lib/test.js';

function testFunc () {
  plan('test: add assertion', t=> {
    const tp = test({
      description: 'a description'
    });

    t.equal(tp.length, 0);
    tp.addAssertion({foo: 'bar'});
    t.deepEqual(tp.assertions, [{description: 'a description', foo: 'bar'}]);
    t.end();
  });

  plan('test: add assertion using n arrity', t=> {
    const tp = test({
      description: 'blah'
    });

    t.equal(tp.length, 0);
    tp.addAssertion({foo: 'bar'}, {foo: 'bis'});
    t.deepEqual(tp.assertions, [{description: 'blah', foo: 'bar'}, {description: 'blah', foo: 'bis'}]);
    t.end();
  });

  plan('test: run and resolve with assertions', t=> {
    const tp = test({
      description: 'desc',
      coroutine: function * (assert) {
        assert.ok(true);
      }
    });

    tp.run()
      .then(function ({assertions, executionTime}) {
        t.deepEqual(assertions, [{
          actual: true,
          description: 'desc',
          expected: 'truthy',
          message: 'should be truthy',
          operator: 'ok',
          pass: true
        }]);
        t.ok(executionTime);
        t.end();
      });
  });

  plan('test: run and resolve with assertions asyn flow', t=> {
    const tp = test({
      description: 'desc',
      coroutine: function * (assert) {
        const presult = new Promise(function (resolve) {
          setTimeout(function () {
            resolve(true);
          }, 100)
        });

        const r = yield presult;

        assert.ok(r);
      }
    });

    tp.run()
      .then(function ({assertions, executionTime}) {
        t.deepEqual(assertions, [{
          actual: true,
          description: 'desc',
          expected: 'truthy',
          message: 'should be truthy',
          operator: 'ok',
          pass: true
        }]);
        t.ok(executionTime);
        t.end();
      });
  });
}

export default testFunc;

