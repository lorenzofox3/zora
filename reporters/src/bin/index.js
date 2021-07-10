#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { EOL } from 'os';
import arg from 'arg';
import { createTAPReporter, createDiffReporter } from '../index.js';
import { createReadStream } from 'fs';
import { compose, filter, map, split } from '../utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const reporterMap = {
  diff: createDiffReporter({}),
  tap: createTAPReporter({}),
};

const {
  ['--reporter']: reporter = 'diff',
  ['--help']: help,
  _: files,
} = arg({
  ['--help']: Boolean,
  ['--reporter']: String,
  ['-R']: '--reporter',
});

(async () => {
  if (help) {
    createReadStream(resolve(__dirname, './usage.txt')).pipe(process.stdout);
    return;
  }

  const getInputStream = compose([
    map(JSON.parse),
    filter(Boolean),
    split(EOL),
  ]);

  const inputStream = getInputStream(process.stdin);

  const report = reporterMap[reporter];

  if (!report) {
    throw new Error(`unknown reporter "${reporter}"`);
  }

  await report(inputStream);
})();
