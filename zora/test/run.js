import { spawnSync } from "child_process";
import { resolve, extname } from "path";
import { readdirSync, readFileSync } from "fs";
import { test } from "zora";

const node = process.execPath;

const sampleRoot = resolve(process.cwd(), "./__tests__/samples/cases/");
const files = readdirSync(sampleRoot).filter(
  (f) => extname(f) === ".js" && f !== "late_collect.js"
); // late collect will be checked separately

for (const f of files) {
  test(`testing file ${f}`, ({ eq }) => {
    const env = {};
    if (f.startsWith("only")) {
      env.ZORA_ONLY = true;
    }
    const cp = spawnSync(node, [f], {
      cwd: sampleRoot,
      stdio: ["pipe", "pipe", "ignore"],
      env,
    });
    const actualOutput = cp.stdout.toString().replace(/at:.*/g, "at:{STACK}");
    const outputFile = `../output/${[f.split(".")[0], "txt"].join(".")}`;
    const expectedOutput = readFileSync(resolve(sampleRoot, outputFile), {
      encoding: "utf8",
    });
    eq(actualOutput, expectedOutput);
  });
}

// __tests__(`late collect should report an error on stderr`, t => {
//     const cp = spawnSync(node, ['-r', 'esm', 'late_collect.js'], {
//         cwd: sampleRoot,
//         stdio: ['pipe', 'pipe', 'pipe']
//     });
//     const actualOutput = cp.stderr.toString();
//     t.ok(actualOutput.startsWith(`Error: __tests__ "late collection"
// tried to collect an assertion after it has run to its completion.
// You might have forgotten to wait for an asynchronous task to complete
// ------
// async t => {
//     t.ok(true);
//
//     setTimeout(() => {
//         t.ok(true);
//     }, 50);
// }`));
//     t.end();
// });
