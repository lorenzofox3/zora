#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import process from 'node:process';
import { createReadStream } from 'node:fs';

import arg from 'arg';
import { globby } from 'globby';
import {
  createDiffReporter,
  createJSONReporter,
  createTAPReporter,
} from 'zora-reporters';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const reporterMap = {
  diff: createDiffReporter(),
  tap: createTAPReporter(),
  json: createJSONReporter(),
  log: createJSONReporter(), // alias for "json"
};

const DEFAULT_FILE_PATTERNS = [
  '**/test.{js,cjs,mjs}',
  '**/*.spec.{js,cjs,mjs}',
  '**/*.test.{js,cjs,mjs}',
  '**/test/**/*.{js,cjs,mjs}',
  '**/tests/**/*.{js,cjs,mjs}',
  '**/__tests__/**/*.{js,cjs,mjs}',
  '!**/node_modules',
  '!node_modules',
];

const {
  ['--reporter']: reporter = 'diff',
  ['--only']: only = false,
  ['--help']: help = false,
  ['--timeout']: defaultTimeout = 5000,
  _: filePatterns,
} = arg({
  ['--reporter']: String,
  ['--only']: Boolean,
  ['--help']: Boolean,
  ['--timeout']: Number,
  // --module-loader is now ignored.
  // kept in schema to avoid breaking user's existing usage.
  ['--module-loader']: String,
  ['-R']: '--reporter',
});

(async () => {
  if (help) {
    createReadStream(resolve(__dirname, './usage.txt')).pipe(process.stdout);
    return;
  }

  // we set the env var before loading zora
  if (only) {
    process.env.ZORA_ONLY = true;
  }

  process.env.ZORA_TIMEOUT = defaultTimeout;

  // loading zora to hold the singleton
  const { hold, report } = await import('zora');
  hold();

  const reporterInstance = reporterMap[reporter] || reporter.diff;
  const files = await globby(
    filePatterns.length ? filePatterns : DEFAULT_FILE_PATTERNS
  );

  if (!files.length) {
    console.warn(`no file matching the patterns: ${filePatterns.join(', ')}`);
    return;
  }

  for (const file of files) {
    const filePath = resolve(process.cwd(), file);
    await import(pathToFileURL(filePath)); // load file in sequence so any top level await allows the tests to run sequentially if needed
  }

  await report({
    reporter: reporterInstance,
  });
})();
