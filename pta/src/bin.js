#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import process from 'node:process';
import { promisify } from 'node:util';
import { createReadStream, readFile as baseReadFile } from 'node:fs';

const readFile = promisify(baseReadFile);

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
  ['--module-loader']: moduleLoader,
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
    await getZoraPackagePath({ moduleLoader })
  );
  hold();

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
      return import(pathToFileURL(filePath));
    })
  );

  await report({
    reporter: reporterInstance,
  });
})();

async function getZoraPackagePath({ moduleLoader }) {
  // force to user choice
  if (moduleLoader) {
    return moduleLoader === 'cjs' ? 'zora/cjs' : 'zora';
  }

  // try to get it from package.json
  const packageJsonPath = resolve(process.cwd(), './package.json');
  try {
    const file = await readFile(packageJsonPath, { encoding: 'utf-8' });
    const { type } = JSON.parse(file);
    return type === 'module' ? 'zora' : 'zora/cjs';
  } catch (e) {
    return 'zora';
  }
}
