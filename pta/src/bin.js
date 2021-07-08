#!/usr/bin/env node
import { resolve } from 'path';
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

const {
  ['--reporter']: reporter = 'diff',
  ['--only']: only = false,
  ['--help']: help = false,
  _: filePatterns = ['todo default'],
} = arg({
  ['--reporter']: String,
  ['--only']: Boolean,
  ['-R']: '--reporter',
});

(async () => {
  if (help) {
    createReadStream(resolve(__dirname, './usage.txt')).pipe(process.stdout);
    return;
  }

  if (only) {
    process.env.ZORA_ONLY = true;
  }

  hold();

  const reporterInstance = reporterMap[reporter] || reporter.diff;

  const files = await globby(filePatterns);

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
