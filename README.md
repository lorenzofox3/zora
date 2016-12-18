# zora
A less than 200 lines of code javascript test harness for **nodejs** and the **browser**

## features
### Zero config
It is just Javascript, write your program, bundle it (if needed) for the environment you want to test in and execute the script ! No whatever.conf.js

### No global
There is no global, just a function providing a two methods api.

### Async testing made easy
Your tests will run coroutines handled by [co](https://github.com/tj/co). So you can write your asynchronous test in a synchronous manner, no need for a callback or to plan ahead.
```Javascript

plan.test('my async test',function *(assert){
    const resolvedResult = yield db.findUser('foo');
    assert.deepEqual(resolvedResult, {name:'foo'}, 'should have fetched mister foo');
});

```


### parallelism 
Each test run in a separate coroutine using [co](https://github.com/tj/co). It will likely be **faster** than other sequential test runners like [tape](https://github.com/substack/tape) for example.
It therefore enforce your tests to be written in isolation which is often a good practice.

### tap producer
By default zora produces a tap report through the console, so you can pipe in with any [tap reporter](https://github.com/sindresorhus/awesome-tap#reporters).

### browser friendly
No sophisticated or platform specific (nodejs) dependency in it. Just regular es2016 Javascript.
You bundle your test program with your favorite module bundler as you would do for you app anyway, and drop it in a browser (or use browser friendly tap reporter). 

## Usage
### simple case one file
```Javascript

import zora from 'zora';

// you create a test plan
const plan = zora();

plan
    .test('a test',function * (assertion){
       assertion.equal('foo','foo');
    })
    .test('another test', function *(assertion){
        assertion.ok(true)
    })
    .run(); // you run it
```
### multiple files setup (recommended)
You might want to split your tests in various files. The recommended way is to make each file exports its own plan... and create a plan of plan.
The main advantages are:
* you'll be able to run your test files separately with the command line tool
* you'll have a single entry point which makes things easier if you want to use a module bundler for example
```Javascript 

//./test/test1.js
import zora from 'zora';

const plan = zora();

plan
    .test('a test',function * (assertion){
       assertion.equal('foo','foo');
    })
    .test('another test', function *(assertion){
        assertion.ok(true)
    })
    
export default plan; // export the plan
    
    
 //./test/index.js
import zora from 'zora';
import plan from './test1.js; // import all your test plans

// you create a test plan
const masterPlan = zora();

masterPlan
    .test(plan)
    .run(); // and run your plans
```

### In the browser



 