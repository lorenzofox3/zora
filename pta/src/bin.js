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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const reporterMap = {
  diff: createDiffReporter(),
  tap: createTAPReporter(),
  json: createJSONReporter(),
  log: createJSONReporter(),
};

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
  ['--module-loader']: moduleLoader = 'es',
  _: filePatterns,
} = arg({
  ['--reporter']: String,
  ['--only']: Boolean,
  ['--help']: Boolean,
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

  // loading zora to hold the singleton -> look for loading strategy (cjs vs es)
  const { hold, report } = await import(
    moduleLoader === 'cjs' ? 'zora/cjs' : 'zora'
  );
  hold();

  // default to diff reporter
  const reporterInstance = reporterMap[reporter] || reporter.diff;

  const files = await globby(
    filePatterns.length ? filePatterns : DEFAULT_FILE_PATTERNS
  );

  if (!files.length) {
    console.warn(`no file matching the patterns: ${filePatterns.join(', ')}`);
    return;
  }

  await Promise.all(
    files.map((file) => {
      const filePath = resolve(process.cwd(), file);
      return import(filePath);
    })
  );

  await report({
    reporter: reporterInstance,
  });
})();
