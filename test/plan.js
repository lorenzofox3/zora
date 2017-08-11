import tape from 'tape';
import plan from '../lib/plan';

function assert (expArray, t) {
  return function * () {
    let index = 0;
    try {
      while (true) {
        const r = yield;
        const {actual, description, expected, message, operator, pass, id, executionTime} = r;
        const exp = expArray[index];
        t.equal(actual, exp.actual);
        t.equal(description, exp.description);
        t.equal(expected, exp.expected);
        t.equal(message, exp.message);
        t.equal(operator, exp.operator);
        t.equal(pass, exp.pass);
        t.equal(id, exp.id);
        t.ok(executionTime !== undefined);
        index++;
      }
    } catch (e){
      console.log(e);
    }
    finally {
      t.equal(index, expArray.length);
      t.end();
    }
  }
}

function testFunc () {

  tape('add a test', t => {
    const description = 'desc';
    const p = plan();
    const spec = () => {
    };

    p.test(description, spec);

    t.equal(p.length, 1);
    t.equal(p.tests[0].description, 'desc');

    t.end();
  });

  tape('compose plans', t => {
    const spec = () => {
    };
    const description = 'desc';
    const p = plan();

    p.test(description, spec);
    const sp = plan();

    sp.test(description, spec);
    sp.test(p);

    t.equal(sp.length, 2);

    t.end();
  });

  tape('only: only run the tests with only statement', t => {
    const p = plan();

    p.test('should not run', (t) => {
      t.fail();
    });

    p.only('should run this one', (t) => {
      t.ok(true);
    });

    p.only('should run this one too', (t) => {
      t.ok(true);
    });

    p.run(assert([
      {
        actual: true,
        description: 'should run this one',
        expected: 'truthy',
        message: 'should be truthy',
        operator: 'ok',
        pass: true,
        id: 1
      },
      {
        actual: true,
        description: 'should run this one too',
        expected: 'truthy',
        message: 'should be truthy',
        operator: 'ok',
        pass: true,
        id: 2
      }

    ], t));
  });

  tape('only: only run the tests with only statement with composition', t => {
    const p1 = plan();
    const p2 = plan();
    const masterPlan = plan();

    p1.test('should not run this test', (t) => {
      t.fail();
    });

    p2.test('should not run', (t) => {
      t.fail();
    });

    p2.only('should run this one', (t) => {
      t.ok(true);
    });

    p2.only('should run this one too', (t) => {
      t.ok(true);
    });

    masterPlan
      .test(p1)
      .test(p2);

    masterPlan.run(assert([
      {
        actual: true,
        description: 'should run this one',
        expected: 'truthy',
        message: 'should be truthy',
        operator: 'ok',
        pass: true,
        id: 1
      },
      {
        actual: true,
        description: 'should run this one too',
        expected: 'truthy',
        message: 'should be truthy',
        operator: 'ok',
        pass: true,
        id: 2
      }
    ], t));
  });

  tape('plan running tests', t => {
    const p = plan();

    p.test('test 1', (assert) => {
      assert.ok(true);
    });

    p.test('test 2', (assert) => {
      assert.ok(true);
    });

    p.run(assert([
      {
        actual: true,
        description: 'test 1',
        expected: 'truthy',
        message: 'should be truthy',
        operator: 'ok',
        pass: true,
        id: 1
      }, {
        actual: true,
        description: 'test 2',
        expected: 'truthy',
        message: 'should be truthy',
        operator: 'ok',
        pass: true,
        id: 2
      }
    ], t));
  });
}

export default testFunc;