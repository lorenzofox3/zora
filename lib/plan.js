import test from './test'
import co from 'co';
import {tap} from './sinks'

const Plan = {
  test(description, coroutine){
    const items = (!coroutine && description.tests) ? [...description] : [{description, coroutine}];
    this.tests.push(...items.map(t=>test(t)));
    return this;
  },

  run(sink = tap()){
    const sinkIterator = sink();
    sinkIterator.next();

    return co(function * () {
      let id = 1;
      try {
        const results = this.tests.map(t=>t.run());
        for (let r of results) {
          const {assertions, executionTime} = yield r;
          for (let assert of assertions) {
            sinkIterator.next(Object.assign(assert, {id, executionTime}));
          }
          id++;
        }
      }
      catch (e) {
        sinkIterator.throw(e);
      } finally {
        sinkIterator.return();
      }
    }.bind(this))
  },

  * [Symbol.iterator](){
    for (let t of this.tests) {
      yield t;
    }
  }
};

function plan () {
  return Object.create(Plan, {
    tests: {value: []}, length: {
      get(){
        return this.tests.length
      }
    }
  });
}

export default plan;