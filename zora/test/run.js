import { spawn } from 'node:child_process';
import { resolve, extname } from 'node:path';
import { readFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { execPath as node } from 'node:process';
import { test } from 'zora';

const ONLY_ERROR = ['no_only_mode.js', 'no_only_mode_nested.js'];
const sampleRoot = resolve(process.cwd(), './test/samples/');

const spawnTest = (file) => {
  const env = {};
  if (file.startsWith('only')) {
    env.ZORA_ONLY = true;
  }
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    const cp = spawn(node, [file], {
      cwd: sampleRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      env,
    });

    cp.stdout.on('data', bufferChunk(stdout));
    cp.stderr.on('data', bufferChunk(stderr));

    cp.on('exit', () => {
      resolve({
        stdout: stdout.replace(/at:.*/g, 'at:{STACK}'),
        stderr: stderr.replace(/at:.*/g, 'at:{STACK}'),
      });
    });
  });
};

const directoryFiles = readdirSync(sampleRoot);
const testCases = directoryFiles.filter(
  (f) => extname(f) === '.js' && !ONLY_ERROR.includes(f)
);

for (const f of testCases) {
  test(`testing file ${f}`, async ({ eq }) => {
    const { stdout } = await spawnTest(f);
    const outputFile = resolve(
      sampleRoot,
      `${[f.split('.')[0], 'txt'].join('.')}`
    );
    const expectedOutput = await readFile(outputFile, {
      encoding: 'utf8',
    });
    eq(stdout, expectedOutput);
  });
}

test(`ONLY mode is not set`, ({ eq }) => {
  for (const f of directoryFiles.filter((f) => ONLY_ERROR.includes(f))) {
    test(`testing file ${f}`, async ({ ok }) => {
      const { stderr } = await spawnTest(f);
      ok(
        stderr.includes(
          `Error: Can not use "only" method when not in "run only" mode`
        )
      );
    });
  }
});

const bufferChunk = (buffer) => (chunk) => (buffer += chunk);
