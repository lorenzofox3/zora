# Zora

[![npm](https://badgen.net/npm/v/zora)](https://www.npmjs.com/package/zora)
[![install size](https://badgen.net/packagephobia/install/zora)](https://packagephobia.now.sh/result?p=zora)

Zora is one of the lightest (if not the lightest), yet one of the fastest Javascript testing library (if not the fastest). It works in many environments
including nodejs and the browser

## Usage

The library is a __regular__ Javascript module and can be directly imported from a CDN:

```Javascript
import {test} from 'https://unpkg.com/zora@5.0.0-alpha.1/dist/index.js'

test(`hello from zora`, ({ok}) => {
    ok(true, 'it worked');
})

```

Or installed via a package manager such [NPM](https://www.npmjs.com/) by running the command (assuming you have [Nodejs](https://nodejs.org/en/) installed on your machine):

``npm i -D zora``

You can then build your testing program by using the exported ``test`` function

```Javascript
import {test} from 'zora';

test(`my very first test`, (assertion) => {
    assertion.ok(true, 'true is always truthy')
})

```

The tests should run automatically and report its execution into the console 

```TAP
TAP version 13
# my very first test
ok 1 - true is always truthy

1..1
# tests 1
# pass  1
# fail  0
# skip  0
```

// todo


