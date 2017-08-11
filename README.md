# zora
A less than 200 lines of code javascript test harness for **nodejs** and the **browser**

[![CircleCI](https://circleci.com/gh/lorenzofox3/zora.svg?style=svg)](https://circleci.com/gh/lorenzofox3/zora)

## Table of Contents 

  - [installation](#installation)
  - [features](#features)
    - [Zero config](#zero-config)
    - [No global](#no-global)
    - [Async testing made easy](#async-testing-made-easy)
    - [parallelism](#parallelism)
    - [fast](#fast)
    - [tap (Test Anything Protocol) producer](#tap-test-anything-protocol-producer)
    - [browser friendly](#browser-friendly)
  - [Usage](#usage)
    - [simple case one file](#simple-case-one-file)
    - [multiple files setup (recommended)](#multiple-files-setup-recommended)
  - [In the browser](#in-the-browser)
    - [drop in file](#drop-in-file)
    - [Use tools that load files for you in a browser (ex karma)](#use-tools-that-load-files-for-you-in-a-browser-ex-karma)
    - [As part of CI (example with rollup)](#as-part-of-ci-example-with-rollup)
  - [Use output data not as a tap output](#use-output-data-not-as-a-tap-output)
  - [CLI](#cli)

## installation
``npm install --save-dev zora``

## features
### Zero config
It is just Javascript, write your program, bundle it (if needed) for the environment you want to test in and execute the script ! No whatever.conf.js

### No global
There is no global, just a function providing a two methods api.

### Async testing made easy
Use the Javascript native [AsyncFunction](http://devdocs.io/javascript/statements/async_function) to write your asynchronous code as it was synchronous. No need for a callback or to plan ahead.
```Javascript

plan.test('my async test',async function (assert){
    const resolvedResult = await db.findUser('foo');
    assert.deepEqual(resolvedResult, {name:'foo'}, 'should have fetched mister foo');
});

```

### parallelism 
Each test run in parallel. It will likely be **faster** than other sequential test runners like [tape](https://github.com/substack/tape) for example.
It therefore enforces you to write your tests in isolation which is often a good practice.

### fast
Zora does not do rocket science but seems to be the **fastest** among mocha, tape, ava, jest on my machine according to [a benchmark I have set up](https://github.com/lorenzofox3/zora-benchmark)
The test is pretty simple: a test suite split into 20 files with 20 tests with an assertion in a nodejs environment. Anyway you can simply fork the repo and sort it out yourself.

### tap (Test Anything Protocol) producer
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
    .test('a test',(assertion) => {
       assertion.equal('foo','foo');
    })
    .test('another test',(assertion) => {
        assertion.ok(true)
    })
    .run(); // you run it
```
### multiple files setup (recommended)
You might want to split your tests in various files. The recommended way is to make each file exports its own plan... and create a plan of plans.
The main advantages are:
* you'll be able to run your test files separately with the command line tool
* you'll have a single entry point which makes things easier if you want to use a module bundler for example
```Javascript 

//./test/test1.js
import zora from 'zora';

const plan = zora();

plan
    .test('a test',(assertion) => {
       assertion.equal('foo','foo');
    })
    .test('another test', (assertion) => {
        assertion.ok(true)
    })
    
export default plan; // export the plan
```

Then in you entry point
```Javascript
//./test/index.js
import zora from 'zora';
import plan from './test1.js'; // import all your test plans

// you create a test plan
const masterPlan = zora();

masterPlan
    .test(plan)
    .run(); // and run your plans (you can omit this line if you want use the command line tool)
```

## In the browser
Zora itself does not depend on native nodejs modules (such file system, processes, etc) so the code you will get is regular es2016 code. The only thing to do is probably to bundle your test script with your favourite module bundler (you might want to transpile your code as well for older browsers).

You can find some recipes [here](https://github.com/lorenzofox3/zora-recipes)

### drop in file
You can simply drop the dist file in the browser (I'll add into CDN if people want it) and write your script below (or load it).
You can for example play with this [codepen](http://codepen.io/lorenzofox3/pen/zoejxv?editors=1112)

```Html
<!-- some content -->
<body>
<script src="path/to/zora.js"></script>
<!-- your test code -->
<script>
    Zora()
      .test('some test', function*(assert) {
        assert.ok(true, 'hey there');
      })
      .test('some failing test', function*(assert) {
        assert.fail('it failed');
      })
      .run();
</script>
</body>
<!-- some content -->
``` 

### Use tools that load files for you in a browser (ex karma)
Same than above but you can ask a runner to handle for you the browsers processes, the bundling/transpilation if any, etc

TODO

### As part of CI (example with rollup)
I will use [rollup](http://rollupjs.org/) for this example, but you should not have any problem with [webpack](https://webpack.github.io/) or [browserify](http://browserify.org/). The idea is simply to create a test file your testing browsers will be able to run.

assuming you have your entry point as follow :
```Javascript
//./test/index.js
import zora from 'zora';
import test1 from './test1.js'; // some tests here
import test2 from './test2.js'; // some more tests there
import test3 from './test3.js'; // another test plan 

const plan = zora()
    .test(test1)
    .test(test2)
    .test(test3)

plan.run();
```

where for example ./test/test1.js is 
```Javascript
import zora from 'zora';

const plan = zora()
    .test('mytest',function * (assertions){
       assertions.ok(true);
    })
    .test('mytest',function * (assertions){
       assertions.ok(true);
    });
    
export default plan;
```

At the time of writing the browsers probably won't understand the [ES module](http://www.2ality.com/2014/09/es6-modules-final.html) syntax so we need to bundle our test file.
Using rollup, we would have the following configuration (for more info follow the [tutorial serie](https://code.lengstorf.com/learn-rollup-js/))

```Javascript
const node = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
module.exports = {
  entry: './test/index.js',
  dest: './test/dist/index.js',
  format: 'iife', //iife as the code will run in the browser
  plugins: [node(), commonjs()], //you can add babel plugin if you need transpilation
  moduleName:'test'
};
```

and that'is it. You can now drop you ./test/dist/index.js in a html document and open it in the browser. You should see something like this in the console
![tap output in the browser console](console-sc.png)

Even better, you can use tap reporter browser friendly such [tape-run](https://www.npmjs.com/package/tape-run) so you'll have a proper exit code depending on the result of your tests. 

so all together, in your package.json you can have something like that
```Javascript
{
// ...
  "scripts": {
    "test": "rollup -c ./test/rollup.config.js && cat ./test/dist/index.js | tape-run"
  }
// ...
}
```
## Use output data not as a tap output

// TODO add a different sink generator example

## Assertions API

The assertion api you can use within your test coroutines is pretty simple and highly inspired from [tape](https://github.com/substack/tape)
* ok
* notOk
* equal
* notEqual
* deepEqual
* notDeepEqual
* throws
* doesNotThrow
* fail

You can use any other assertion library as well but a failing assertion will likely throw an exception which won't be properly tape reported
