# zora
Fast javascript test runner for **nodejs** and **browsers**

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
    - [As part of CI (example with rollup)](#as-part-of-ci-example-with-rollup)
  - [Use output data not as a tap output](#use-output-data-not-as-a-tap-output)
  - [CLI](#cli)

## installation
``npm install --save-dev zora``

## features
### ⚡️ Zero config
It is just Javascript, write your test program, bundle it (if needed) for the environment you want to test in and execute the script! No whatever.conf.js or specific test runner.

### 🎯 No global
There is no global, just a function providing a two methods API.

### ⌛️ Async testing made easy
Use the Javascript native [AsyncFunction](http://devdocs.io/javascript/statements/async_function) to write your asynchronous code as it was synchronous. No need for a callback or to plan ahead.
```Javascript
plan.test('my async test',async (assert) => {
    const resolvedResult = await db.findUser('foo');
    assert.deepEqual(resolvedResult, {name:'foo'}, 'should have fetched mister foo');
});

```
### 📐 "parallelism"
Each test run in "parallel", ie as

```Javascript
const tests = [test1,test2,test3];

const results = Promise.all(tests.map(t=>t.run()));
```
(so do note, they run it the same process)

It will likely be **faster** than other sequential test runner.
It therefore enforces you to write your tests in isolation which is often a good practice.

### 🚀 fast
Zora does not do rocket science but seems to be the **fastest** among mocha, tape, ava, jest on my machine according to a simple test case.
The test is pretty simple: a nodejs test suite split into N(=8) files with M(=8) tests lasting T(=60ms). Anyway you can simply fork the repo and sort it out yourself.
To generate the benchmark files run `npm run build:benchmark`
Then you can run the tests with the framework of your choice.
Ex:
`npm run bench:zora`

### 💄 tap (Test Anything Protocol) producer
By default zora produces a tap report through the console, so you can pipe in with any [tap reporter](https://github.com/sindresorhus/awesome-tap#reporters). Alternatively you can use the reporter API to build any custom reporter... even a full [dashboard](https://github/lorenzofox3/zora-reporter)

### 🌎 browser friendly
No sophisticated or platform specific (nodejs) dependency in it. Just regular EcmaScript supported by all the major platforms and browsers.
Moreover Zora does not make any choice on transpilation, bundling, file serving, etc like most other test runners. You use what fits the best for your use cases and you don't need any specific test runner.

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
You'll have a single entry point which makes things easier if you want to use a module bundler for example or quickly skip a whole set of tests.
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
import plan1 from './test1.js'; // import all your test plans
import plan2 from './test2.js'; // import all your test plans
// etc

// you create a test plan
const masterPlan = zora();

masterPlan
    .test(plan1)
    .skip(plan2)
    .run(); // and run your plans
```

## In the browser
Zora itself does not depend on native nodejs modules (such file system, processes, etc) so the code you will get is regular Ecmascript

You can find some recipes [here](https://github.com/lorenzofox3/zora-recipes)

### drop in file
You can simply drop the dist file in the browser and write your script below (or load it).
You can for example play with this [codepen](http://codepen.io/lorenzofox3/pen/zoejxv?editors=1112)

```Html
<!-- some content -->
<body>
<script src="path/to/zora.js"></script>
<!-- your test code -->
<script>
    Zora()
      .test('some test', (assert) => {
        assert.ok(true, 'hey there');
      })
      .test('some failing test', (assert) => {
        assert.fail('it failed');
      })
      .run();
</script>
</body>
<!-- some content -->
```

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
    .test('mytest',(assertions) => {
       assertions.ok(true);
    })
    .test('mytest',(assertions) => {
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
    "test": "rollup -c ./test/test.js && cat ./test/dist/index.js | tape-run"
  }
// ...
}
```
## Use output data not as a tap output

// TODO add a different sink generator example

## Assertions API

The assertion api you can use within your test is pretty simple and highly inspired from [tape](https://github.com/substack/tape)
* ok
* notOk
* equal
* notEqual
* deepEqual
* notDeepEqual
* throws
* doesNotThrow
* fail

You can use any other assertion library as well but a failing assertion will likely throw an exception which won't be properly tap reported
