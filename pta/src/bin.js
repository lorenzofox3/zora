#!/usr/bin/env node
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';
import arg from 'arg';
import globby from 'globby';
import {
  createTAPReporter,
  createJSONReporter,
  createDiffReporter,
} from 'zora-reporters';
import { hold, report } from 'zora';

const reporterMap = {
  diff: createDiffReporter(),
  tap: createTAPReporter(),
  json: createJSONReporter(),
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_FILE_PATTERNS = [
  '**/test.js',
  '**/*.spec.js',
  '**/*.test.js',
  '**/test/**/*.js',
  '**/tests/**/*.js',
  '**/__tests__/**/*.js',
  '!**/node_modules',
  '!node_modules',
];
const {
  ['--reporter']: reporter = 'diff',
  ['--only']: only = false,
  ['--help']: help = false,
  _: filePatterns,
} = arg({
  ['--reporter']: String,
  ['--only']: Boolean,
  ['--help']: Boolean,
  ['-R']: '--reporter',
});

(async () => {
  hold();

  if (help) {
    createReadStream(resolve(__dirname, './usage.txt')).pipe(process.stdout);
    return;
  }

  if (only) {
    process.env.ZORA_ONLY = true;
  }

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
    await import(filePath);
  }

  await report({
    reporter: reporterInstance,
  });
})();
