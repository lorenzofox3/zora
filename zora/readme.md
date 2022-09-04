# Zora

[![npm](https://badgen.net/npm/v/zora)](https://www.npmjs.com/package/zora)
[![install size](https://badgen.net/packagephobia/install/zora)](https://packagephobia.now.sh/result?p=zora)

## Usage

The library is a _regular_ Javascript module and can be directly imported from a CDN:

```Javascript
import {test} from 'https://unpkg.com/zora@latest/dist/index.js'

test(`hello from zora`, ({ok}) => {
    ok(true, 'it worked');
})
```

(Like in the [following codepen](https://codepen.io/lorenzofox3/pen/LYWOaYV?editors=1111))

Or installed via a package manager such [NPM](https://www.npmjs.com/) by running the command (assuming you have [Nodejs](https://nodejs.org/en/) installed on your machine):

``npm i -D zora``

You can then build your testing program by using the exported ``test`` function

```Javascript
import {test} from 'zora';

test(`my very first test`, (assertion) => {
    const input = false;
    assertion.ok(input, 'input should be truthy');
})

```

You can run the testing program (with node's runtime for example) and it will start reporting its execution into the console 

<details>
    <summary>test-output.tap</summary>

```TAP
TAP version 13
# my very first test
not ok 1 - input should be truthy
  ---
    actual: false
    expected: "truthy value"
    operator: "ok"
    at: " file:///path/to/sample.js:5:13"
  ...

1..1
# tests 1
# pass  0
# fail  1
# skip  0

```

</details>

## Reporters

This output format is called [TAP](https://testanything.org/tap-version-13-specification.html) (Test Anything Protocol). It is a standard text based format a machine can easily parse. It means there are [plenty of reporters](https://www.npmjs.com/search?q=tap%20reporter) you can pipe the standard output stream into (not only in the Javascript world). This will help you to tailor the reporting for your particular needs.

for example, you can use [tap-diff](https://www.npmjs.com/package/tap-diff):
``node path/to/testing/program.js | tap-diff``

You can even use basic bash command:

``node path/to/testing/program.js | grep '^not ok\|^\s'`` will output a basic, straight to the point test report:

```
not ok 1 - input should be truthy
  ---
    actual: false
    expected: "truthy value"
    operator: "ok"
    at: " file:///path/to/sample.js:5:13"
  ...
```

That is the beauty of using different processes to run the testing program and to format its output: it remains very flexible.

## Assertion API

When you start a test suite with the ``test`` function. The spec functions you pass as argument will get an instance of the [Assertion object](../assert) so you can write a wide range of different expectations.

For the best performances, all the spec functions run concurrently unless you specifically wait for them within an asynchronous function (if for some reason, you want to run some test one after the other, in a serial mode).

<details>
    <summary>control-flow.js</summary>

```Javascript
import {test} from 'zora';

let state = 0;

test('test 1', t => {
    t.ok(true);
    state++;
});

test('test 2', t => {
    //Maybe yes maybe no, you have no guarantee ! In this case it will work as everything is sync
    t.equal(state, 1);
});

//Same thing here even in nested tests
test('grouped', t => {
    let state = 0;

    t.test('test 1', t => {
        t.ok(true);
        state++;
    });

    t.test('test 2', t => {
        //Maybe yes maybe no, you have no guarantee ! In this case it will work as everything is sync
        t.equal(state, 1);
    });
});

//And
test('grouped', t=>{
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
test('grouped', async t => {
    let state = 0;

    //specifically WAIT for the end of this test before moving on !
    await t.test('test 1', async t => {
        t.ok(true);
        await wait(100);
        state++;
    });

    test('test 2', t => {
        t.equal(state, 1, 'see the updated value!');
    });
});
```

</details>


## Environment variables

You can _configure_ the testing program with environment variables. With nodejs, simply pass it with the command line:

``ZORA_REPORTER=json node path/to/testing/program.js``

In the browser, you have to set it as a global before the testing program runs:

```HTML
<script>
    window.ZORA_REPORTER='json'
</script>
<script type="module">
    import {test} from 'url/to/zora';
    
    test('some test', (t) => {
        t.ok(true);
    })
</script>
```

### ZORA_REPORTER=json

By default, the output is a TAP stream; but you can decide to produce a stream defined by [the zora json protocol messages](../reporters) if you which to build a custom reporter on top of it.

### ZORA_ONLY=true

Beside the ``test`` function you can use the ``only`` function if you wish to skip all the other tests. However, from the testing program perspective, ``only`` is meaningless: it is just a convenience for a developer, locally on its machine.  
So if you wish to use ``only`` you need to pass the ``ZORA_ONLY`` environment variable, otherwise the program will throw an exception to prevent ``only`` statement to slip in the remote versioning control system.

Beware that if you want to run only a nested test suite, all the parent test suites must use the ``only statement`:`

<details>
    <summary>test-with-only.js</summary>

```Javascript
import {only, test} from 'zora';

test('will be skipped', t => {
    t.ok(false);
})

only('some test', t => {
 
    // will be skipped as well
    t.test('some nested test', t => {
        t.ok(false);
    });
    
    // will run
    t.only('some other nested test', t => {
        t.ok(true);
    });
});
```

</details>

### ZORA_TIMEOUT

In milliseconds: change the default test timeout value (see below)

## test timeout

If a test hangs or takes too long to complete, it will report a failure. By default, the threshold is 5000ms. You can change that global value thanks to the ``ZORA_TIMEOUT`` environment variable.
You can change that value for a given text as well, thanks to the options object:

<details>
    <summary>timeout example</summary>

```Javascript
test(
  'broken promise',
  ({ ok }) => {
    return new Promise(() => {}).then(() => {
      ok(true);
    });
  },
  { timeout: 500 }
);
```

</details>

## skip a test

You can skip a test using the root level ``skip`` function or within a test suite using the ``skip`` method of the assertion object

<details>
    <summary>test-with-skip.js</summary>

```Javascript
import {skip, test} from 'zora';

skip('will be skipped', t => {
    t.ok(false);
})

test('some test', t => {
 
    // will be skipped as well
    t.skip('some nested test', t => {
        t.ok(false);
    });
    
    // will run
    t.test('some other nested test', t => {
        t.ok(true);
    });
});
```

</details>
