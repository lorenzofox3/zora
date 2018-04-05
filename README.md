# zora

Fast javascript test runner for **nodejs** and **browsers**

[![CircleCI](https://circleci.com/gh/lorenzofox3/zora.svg?style=svg)](https://circleci.com/gh/lorenzofox3/zora)

## installation
``npm install --save-dev zora``

## (Un)Opinions and Design

These are the following rules and ideas I have followed while developing zora. Whether they are right or not is an entire different topic ! :D
Note I have decided to develop zora specially because I was not able to find a tool which complies entirely with these ideas.

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
1. Node: ``node ./myTestFile.js``
2. In the browser ``<script type="module" src="./myTestFile.js></script>`` identically

Moreover zora does not use specific platform API which should make it transparent to most of your tools such module bundlers or transpilers.

In few words:
> Zora is only Javascript, no less, no more.

### Tests are fast

Tests are part of our daily routine as software developers. Performance is part of the user experience and there is no reason you should wait seconds for your tests to run.
Zora is by far the **fastest** Javascript test runner in the ecosystem.

### Benchmark

This repository includes a benchmark which consists on running N test files, with M tests in each and where one tests lasts T milliseconds.
About 10% of tests should fail.

1. profile library: N = 5, M = 8, T = 25ms
2. profile web app: N = 10, M = 8, T = 40ms
3. profile api: N =12, M = 10, T = 100ms

Each framework runs with its default settings

Here are the result of different test frameworks on my developer machine with node 9.3.0 :

|        |  zora@2.0.0  |  tape@4.8.0 |  Jest@22.2.2  |  AvA@0.25.0  |  Mocha@5.0.0|
|--------|:------------:|:-----------:|:-------------:|:------------:|------------:|
|Library |  118ms       |  1239ms     |  1872ms       |  1703ms      |  1351ms     |
|Web app |  142ms       |  3597ms     |  4356ms       |  2441ms      |  3757ms     |
|API     |  203ms       |  12637ms    |  13385ms      |  2966ms      | 12751ms     |

Of course as any benchmark, it may not cover your use case and you should probably run your own tests before you draw any conclusion

### Focus on tests only

zora does one thing but hopefully does it well: **test**.

In my opinions:
1. Pretty reporting (I have not said *efficient reporting*) should be handled by a specific tool.
2. Transipilation and other code transformation should be handled by a specific tool.
3. File watching and caching should be handled by a specific tool.
4. File serving should be handled by a specific tool.
5. Coffee should me made by a specific tool.

As a result zora is only **1Kb** of code whereas it lets you use whatever better tool you want for any other specific task you may need within your workflow.

### Control flow is managed the way you want with regular Javascript idioms

Lately Ecmascript specification has improved a lot (and its various implementation) in term of asynchronous code.
There is no reason you could not benefit from it while writing your tests.
In zora, asynchronous code is as simple as async function, you do not need to manage a plan or to notify the test framework the end of a test

```Javascript
import test from 'zora';

test('should handle async operation', async t => {
    const user = await getUserAsync();
    t.deepEqual(user,{name:'John doe'});
});
```

### Reporter is handled with other process (TAP)

When you run a test you usually want to know whether there is any failure, where and why in order to debug and solve the issue as fast as possible.
Whether you want it to be printed in red, yellow etc is a matter of preference.

For this reason, zora output [TAP](http://testanything.org/) (Test Anything Protocol) by default. This protocol is widely used and [there are plenty of tools](https://github.com/sindresorhus/awesome-tap) to parse and deal with it the way **you** want.

You are not stuck into a specific reporting format, you'll be using a *standard* instead.

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

### Assertions API

The assertion api you can use within your test is pretty simple and highly inspired by [tape](https://github.com/substack/tape)
* ok
* notOk
* equal
* notEqual
* deepEqual
* notDeepEqual
* throws
* doesNotThrow
* fail

### Control flow

Notice that each test runs in its own micro task in parallel (for performance). It implies your tests should not depend on each other.
It is often a good practice.
However, you'll be able to group your tests if you wish to conserve some state between them or wait one to finish before you start another one (ideal with tests running against real database).

The sequence is simply controlled by AsyncFunction (and await keyboard)

```Javascript

let state = 0;

test('test 1', t=>{
    t.ok(true);
    state++;
});

test('test 2', t=>{
    //Maybe yes maybe no, you have no guarantee ! In this case it will work as everything is sync
    t.equal(state, 1);
});

//Same thing here even in nested tests
t.test('grouped', t=>{
    let state = 0;

    t.test('test 1', t=>{
        t.ok(true);
        state++;
    });

    t.test('test 2', t=>{
        //Maybe yes maybe no, you have no guarantee ! In this case it will work as everything is sync
        t.equal(state, 1);
    });
});

//And
t.test('grouped', t=>{
    let state = 0;

    t.test('test 1', async t=>{
        t.ok(true);
        await wait(100);
        state++;
    });

    test('test 2', t=>{
        t.equal(state, 0, 'see the old state value as it will have started to run before test 1 is done');
    });
});

//But
t.test('grouped', async t=>{
    let state = 0;

    //specifically wait the end of this test before continuing !
    await t.test('test 1', async t=>{
        t.ok(true);
        await wait(100);
        state++;
    });

    test('test 2', t=>{
        t.equal(state, 1, 'see the updated value!');
    });
});
```

### BDD style

zora also allows you to nest tests in each other in a [BDD style](https://en.wikipedia.org/wiki/Behavior-driven_development).
You just need to call the `test` property of zora at root level.

```js
import zora from 'zora';
const describe = zora.test;

// and write you tests
describe('test 1', t => {

	t.ok(true, 'assert1');

    // inside simply call t.test for nested test
	t.test('some nested test', t => {
		t.ok(true, 'nested 1');
		t.ok(true, 'nested 2');
	});

	t.test('some nested test bis', t => {
		t.ok(true, 'nested 1');

		t.test('deeply nested', t => {
			t.ok(true, 'deeply nested really');
			t.ok(true, 'deeply nested again');
		});

		t.ok(true, 'nested 2');
	});

	t.ok(true, 'assert2');
});

describe('test 2', t => {
	t.ok(true, 'assert3');

	t.test('nested in two', t => {
		t.ok(true, 'still happy');
	});

	t.ok(true, 'assert4');
});
```

The output is a valid tap output where sub plans are indented
```
TAP version 13
    # Subtest: test 1
    ok 1 - assert1
        # Subtest: some nested test
        ok 1 - nested 1
        ok 2 - nested 2
        1..2
        # time=1ms
    ok 2 - some nested test # time=1ms
        # Subtest: some nested test bis
        ok 1 - nested 1
            # Subtest: deeply nested
            ok 1 - deeply nested really
            ok 2 - deeply nested again
            1..2
            # time=1ms
        ok 2 - deeply nested # time=1ms
        ok 3 - nested 2
        1..3
        # time=1ms
    ok 3 - some nested test bis # time=1ms
    ok 4 - assert2
    1..4
    # time=1ms
ok 1 - test 1 # time=1ms
    # Subtest: test 2
    ok 1 - assert3
        # Subtest: nested in two
        ok 1 - still happy
        1..1
        # time=1ms
    ok 2 - nested in two # time=1ms
    ok 3 - assert4
    1..3
    # time=1ms
ok 2 - test 2 # time=1ms
1..2
# ok
```

The structure can be parsed with common tap parser (such as [tap-parser]()) And will be parsed as well by tap parser which
do not understand the indentation. However to take full advantage of the structure you should probably use a formatter (such [tap-mocha-reporter](https://www.npmjs.com/package/tap-mocha-reporter)) aware of this specific structure to get the whole benefit
of the format.

![tap output in a BDD format](./media/bsd.png)

### In the browser

Zora itself does not depend on native nodejs modules (such file system, processes, etc) so the code you will get is regular EcmaScript.

// todo add some more recipe (WIP) karma, dependencies, transpilations etc

#### drop in file
You can simply drop the dist file in the browser and write your script below (or load it).
You can for example play with this [codepen](http://codepen.io/lorenzofox3/pen/zoejxv?editors=1112)

```Html
<!-- some content -->
<body>
<script type="module">

import test from 'path/to/zora';

test('some test', (assert) => {
    assert.ok(true, 'hey there');
})

test('some failing test', (assert) => {
    assert.fail('it failed');
})
</script>
</body>
<!-- some content -->
```

#### As part of CI (example with rollup)
I will use [rollup](http://rollupjs.org/) for this example, but you should not have any problem with [webpack](https://webpack.github.io/) or [browserify](http://browserify.org/). The idea is simply to create a test file your testing browsers will be able to run.

assuming you have your entry point as follow :
```Javascript
//./test/index.js
import test1 from './test1.js'; // some tests here
import test2 from './test2.js'; // some more tests there
import test3 from './test3.js'; // another test plan 
```

where for example ./test/test1.js is 
```Javascript
import test from 'zora';

test('mytest',(assertions) => {
   assertions.ok(true);
})

test('mytest',(assertions) => {
   assertions.ok(true);
});
```
you can then bundle your test as single app.

```Javascript
const node = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
module.exports = {
  input: './test/index.js',
  output:[{
    name:'test',
    format:'test',
    sourcemap:'inline' // ideal to debug
  }]
  plugins: [node(), commonjs()], //you can add babel plugin if you need transpilation
};
```

You can now drop the result into a debug file
``rollup -c path/to/conf > debug.js``

And read with your browser (from an html document for example).

![tap output in the browser console](./media/console-sc.png)

Even better, you can use tap reporter browser friendly such [tape-run](https://www.npmjs.com/package/tape-run) so you'll have a proper exit code depending on the result of your tests. 

so all together, in your package.json you can have something like that
```Javascript
{
// ...
  "scripts": {
    "test": "rollup -c path/to/conf | tape-run"
  }
// ...
}
```
