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

On my machine (MacBook Pro, 2.4 GHz i5, 16 GB RAM) for various profiles I get:

Library: files=5, tests=8, idle=5
Small Web app: files=10, tests=10, idle=30
Web app: files=100, tests=10, idle=30

|        |  zora@next  |   with pta@next  |  tape@5.2.2 |  Jest@27.0.6  |  AvA@3.15.0  |  Mocha@9.0.2| uvu@0.5.1
|--------|:------------:|:------------:|:------------:|:-------------:|:------------:|:----------:|:----------:|
|Library |    68ms     |     132ms    |    NA    |    1340ms     |    780ms    |    497ms  | 335ms |
|small web app |    111ms     |     173ms    |    NA    |    4655ms     |    1228ms    |    1163ms  | 3399ms |
|web app     |    288ms     |     302ms    |   NA    |    7493ms     |    7927ms    |   5620ms  | 33310ms |
