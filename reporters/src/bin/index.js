#!/usr/bin/env node
import { stream } from '@lorenzofox3/for-await';
import arg from 'arg';
import { EOL } from 'os';
import { createTAPReporter, createDiffReporter } from '../index.js';

const reporterMap = {
  diff: createDiffReporter({}),
  tap: createTAPReporter({}),
};

const { ['--reporter']: reporter = 'diff' } = arg({
  ['--reporter']: String,
  ['-R']: '--reporter',
});

const splitChunkToLines = (chunk) => chunk.toString().split(EOL);

(async () => {
  const inputStream = stream(process.stdin)
    .map((chunk) => stream(splitChunkToLines(chunk)).filter(Boolean))
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
