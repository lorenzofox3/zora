import { spawn } from 'node:child_process';
import { resolve, extname } from 'node:path';
import { readFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import {execPath as node} from 'node:process'
import { test } from 'zora';

const sampleRoot = resolve(process.cwd(), './test/samples/');

const spawnTest = (file) => {
  const env = {};
  if (file.startsWith('only')) {
    env.ZORA_ONLY = true;
  }
  return new Promise((resolve) => {
    let output = '';

    const cp = spawn(node, [file], {
      cwd: sampleRoot,
      stdio: ['pipe', 'pipe', 'ignore'],
      env,
    });

    cp.stdout.on('data', (chunk) => (output += chunk));
    cp.on('exit', () => {
      resolve(output.replace(/at:.*/g, 'at:{STACK}'));
    });
  });
};

const testCases = readdirSync(sampleRoot).filter(
  (f) => extname(f) === '.js'
);

for (const f of testCases) {
  test(`testing file ${f}`, async ({ eq }) => {
    const actualOutput = await spawnTest(f);
    const outputFile = resolve(sampleRoot, `${[f.split('.')[0], 'txt'].join('.')}`);
    const expectedOutput = await readFile(outputFile, {
      encoding: 'utf8',
    });
    eq(actualOutput, expectedOutput);
  });
}
