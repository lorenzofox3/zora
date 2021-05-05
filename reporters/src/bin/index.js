#!/usr/bin/env node
import { stream } from '@lorenzofox3/for-await';
import arg from 'arg';
import { EOL } from 'os';
import { createTAPReporter } from '../index.js';
import { createDiffReporter } from '../diff/index.js';

const reporterMap = {
  diff: createDiffReporter({}),
  tap: createTAPReporter({}),
};

const { ['--reporter']: reporter = 'diff' } = arg({
  ['--reporter']: String,
  ['-R']: '--reporter',
});

(async () => {
  const inputStream = stream(process.stdin)
    .map((chunk) => stream(chunk.toString().split(EOL)).filter(Boolean))
    .flatMap(JSON.parse);

  const report = reporterMap[reporter];

  if (!report) {
    throw new Error(`unknown reporter "${reporter}"`);
  }

  await report(inputStream);

  // for await (const message of inputStream) {
  //   console.log(message);
  // }
})();
