import { execFile } from 'child_process';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
import { test } from 'zora';

const exec = promisify(execFile);
const node = process.execPath;

const run = ({ args, cwd = process.cwd() }) => {
  const fullCWD = resolve(process.cwd(), cwd);
  const bin = relative(cwd, resolve(process.cwd(), 'src/bin.js'));
  return exec(node, [bin, ...args], {
    cwd: fullCWD,
  });
};

const loadFileContent = (path) =>
  readFileSync(resolve(process.cwd(), path)).toString();

test(`only mode should only run test with only flag`, async (t) => {
  try {
    const { stderr, stdout } = await run({
      args: ['*.js', '--only'],
      cwd: './test/samples/only/',
    });
    t.ok(stdout);
    t.notOk(stderr);
  } catch (e) {
    t.fail(`should not have any error`);
  }
});

test(`no only mode should throw when testing program uses "only"`, async (t) => {
  try {
    await run({
      args: ['*.js'],
      cwd: 'test/samples/only/',
    });
    t.fail('should not pass');
  } catch (e) {
    t.eq(e.code, 1, 'exit code should be 1');
    t.ok(
      e.stderr.includes(
        `Error: Can not use "only" method when not in "run only" mode`
      )
    );
  }
});

// t.test(`errored test suite should exit the process with code 1`, async t => {
//     try {
//         await run({
//             args: ['*.js'],
//             cwd: 'test/samples/errored/'
//         });
//         t.fail('should not pass');
//     } catch (e) {
//         t.eq(e.code, 1, 'exit code should be 1');
//         t.ok(e.stderr.startsWith(`Error: some error`));
//     }
// });

// t.test(`failing test suite should exit the process with code 1`, async t => {
//     try {
//         await run({
//             args: ['*.js'],
//             cwd: 'test/samples/failing'
//         });
//         t.fail('should not pass');
//     } catch (e) {
//         t.eq(e.code, 1, 'exit code should be 1');
//     }
// });

test('--help should output the help content', async (t) => {
  try {
    const { stderr, stdout } = await run({ args: ['--help'] });
    t.eq(stdout, loadFileContent('./src/usage.txt').toString());
    t.notOk(stderr);
  } catch (e) {
    t.fail(`should not have any error`);
  }
});

test('use tap reporter', async (t) => {
  try {
    const { stderr, stdout } = await run({
      args: ['*.js', '-R', 'tap'],
      cwd: 'test/samples/dummy',
    });
    t.eq(stdout, loadFileContent('test/samples/dummy/tap.txt'));
    t.notOk(stderr);
  } catch (e) {
    t.fail(`should not have any error`);
  }
});

test('use log reporter', async (t) => {
  try {
    const { stderr, stdout } = await run({
      args: ['*.js', '-R', 'log'],
      cwd: 'test/samples/dummy/',
    });
    t.eq(
      stdout.replace(/"executionTime":\d+,/g, '"executionTime":{TIME},'),
      loadFileContent('test/samples/dummy/log.txt')
    );
    t.notOk(stderr);
  } catch (e) {
    t.fail(`should not have any error`);
  }
});

test(`should load cjs files`, async (t) => {
  try {
    const { stderr, stdout } = await run({
      args: ['test/*.{js,cjs}'],
      cwd: './test/samples/cjs',
    });
    t.ok(stdout);
    t.notOk(stderr);
  } catch (e) {
    console.log(e);
    t.fail(`should not have any error`);
  }
});

test(`should work with es files`, async (t) => {
  try {
    const { stderr, stdout } = await run({
      args: ['test/*.{js,mjs}'],
      cwd: './test/samples/es',
    });
    t.ok(stdout);
    t.notOk(stderr);
  } catch (e) {
    console.log(e);
    t.fail(`should not have any error`);
  }
});
