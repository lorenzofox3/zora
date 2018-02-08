# zora

Fast javascript test runner for **nodejs** and **browsers**

[![CircleCI](https://circleci.com/gh/lorenzofox3/zora.svg?style=svg)](https://circleci.com/gh/lorenzofox3/zora)

## installation
``npm install --save-dev zora``

## (Un)Opinions and Design

### Tests are regular Javascript programs.

You don't need a specific test runner, a specific platform or any build step to run your `zora` tests. They are only regular valid EcmaScript 2017 programs.
If you have the following test.
```Javascript
import test from 'path/to/zora';

test('should result to the answer', t=>{
    const answer = 42
    t.equal(answer, 42, 'answer should be 42');
});
```

You can run your test with
1. Node: ``node ./myTestFile.js`
2. In the browser ``<script type="module" src="./myTestFile.js></script>`` identically

Moreover zora does not use specific platform API which should make it transparent to your module bundler or transpiler.

In few words:
> Zora is only Javascript, no less, no more.

### Tests are fast

### Control flow is managed the way you want with regular Javascript idioms

### Reporter is handled with other process (TAP)

blahblah


## Usage

Zora API is very straightforward: you have only **1** function and the assertion library is pretty standard and obvious.
The tests will start by themselves with no extra effort.

```Javascript
import test from 'zora';

test('some independent test', t=>{
    t.equal(1+1,2,'one plus one should equal 2');
});

test('other independent test', t=>{
    t.equal(1+2,3,'one plus two should equal 3');
});
```

### Control flow

//




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
