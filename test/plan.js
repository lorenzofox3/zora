import tape from 'tape';
import plan from '../lib/plan';

function testFunc () {

  tape('add a test', t=> {
    const coroutine = function * () {
    };
    const description = 'desc';
    const p = plan();

    p.test(description, coroutine);

    t.equal(p.length, 1);
    t.equal(p.tests[0].coroutine, coroutine);
    t.equal(p.tests[0].description, 'desc');

    t.end();
  });

  tape('compose plans', t=> {
    const coroutine = function * () {
    };
    const description = 'desc';
    const p = plan();

    p.test(description, coroutine);
    const sp = plan();

    sp.test(description, coroutine);
    sp.test(p);

    t.equal(sp.length, 2);

    t.end();
  });

  tape('plan running tests', t=> {
    t.plan(16);

    const p = plan();

    p.test('test 1', function * (assert) {
      assert.ok(true);
    });

    p.test('test 2', function * (assert) {
      assert.ok(true);
    });

    p.run(function * () {
      let time = 1;
      while (true) {
        const assertion = yield;
        const {actual, description, expected, message, operator, pass, id, executionTime}=assertion;
        if (time === 1) {
          t.equal(actual, true);
          t.equal(description, 'test 1');
          t.equal(expected, 'truthy');
          t.equal(message, 'should be truthy');
          t.equal(operator, 'ok');
          t.equal(pass, true);
          t.equal(id, 1);
          t.ok(executionTime !== undefined);
        } else {
          t.equal(actual, true);
          t.equal(description, 'test 2');
          t.equal(expected, 'truthy');
          t.equal(message, 'should be truthy');
          t.equal(operator, 'ok');
          t.equal(pass, true);
          t.equal(id, 2);
          t.ok(executionTime !== undefined);
        }
        time++;
      }
    })
  });
}

export default testFunc;