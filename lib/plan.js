import test from './test'
import co from 'co';
import {tap} from './sinks'

const Plan = {
  test(description, coroutine, opts = {}){
    const testItems = (!coroutine && description.tests) ? [...description] : [{description, coroutine}];
    this.tests.push(...testItems.map(t=>test(Object.assign(t, opts))));
    return this;
  },

  only(description, coroutine){
    return this.test(description, coroutine, {only: true});
  },

  run(sink = tap()){
    const sinkIterator = sink();
    sinkIterator.next();
    const hasOnly = this.tests.some(t=>t.only);
    const runnable = hasOnly ? this.tests.filter(t=>t.only) : this.tests;
    return co(function * () {
      let id = 1;
      try {
        const results = runnable.map(t=>t.run());
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
    tests: {value: []},
    length: {
      get(){
        return this.tests.length
      }
    }
  });
}

export default plan;