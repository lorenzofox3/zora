#!/usr/bin/env node
'use strict';
const meow = require('meow');
const zora = require('./dist/zora.js');
const path = require('path');

const cli = meow(`
    Usage
      $ zora <testFile>

    where testFile must export a test plan 

    Examples
      $ zora ./test/index.js
`, {});

return Promise.resolve()
  .then(function () {
    const [testFile] = cli.input;
    const filePath = path.join(process.cwd(), testFile);
    const plan = require(filePath);
    return plan.run();
  });
