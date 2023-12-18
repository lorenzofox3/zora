# perfs

A program that aims at giving an idea on how fast common testing libraries/framework can run a similar test suite 

1. install the dependencies ``npm install``
2. clean the suites ``npm run perf:clean``
3. generate a profile ``node scripts/test-files-io.js --files 10 --tests 8 --idle 20``

Where:
* files: the number of files in the suites
* tests: the number of tests in a file
* idle: the time (in ms) a given test is idle before resuming

A test would be the equivalent with each library/framework

```javascript
import {test} from 'zora';

test('test ' + i, async function (assert) {
    await new Promise(resolve => {
        setTimeout(()=>resolve(),${idleTiem});
    });
    assert.ok(Math.random() * 100 > 5); // 5% of the tests should fail
});
```

This test should represent "common" javascript code: non-blocking IO

## Results

On my machine (MacBook Pro, 2.7 GHz i5, 8 GB RAM) for various profiles I get:

Library: files=5, tests=8, idle=5
Small Web app: files=10, tests=10, idle=30
Web app: files=100, tests=10, idle=30

|        | zora@next | with pta@next | tape@5.7.2 | Jest@29.7.0 | AvA@6.0.1 | Mocha@10.2.0 | uvu@0.5.6 
|--------|:---------:|:-------------:|:----------:|:-----------:|:---------:|:------------:|:---------:|
|Library |   124ms   |     204ms     |   511ms    |   2550ms    |  1705ms   |    582ms     |   369ms   |
|small web app |   122ms   |     208ms     |   555ms    |   1853ms    |  2616ms   |    767ms     |   294ms   |
|web app     |   608ms   |     475ms     |   3521ms   |   11780ms   |  35320ms  |    2050ms    |  1790ms   |
