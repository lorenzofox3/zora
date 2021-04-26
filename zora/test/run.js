import { spawnSync, spawn } from "child_process";
import { resolve, extname } from "path";
import { readFile } from "fs/promises";
import { readdirSync } from "fs";
import { test } from "zora";

const node = process.execPath;

const sampleRoot = resolve(process.cwd(), "./test/samples/cases/");
const spawnTest = (file) => {
  const env = {};
  if (file.startsWith("only")) {
    env.ZORA_ONLY = true;
  }
  return new Promise((resolve) => {
    let output = "";

    const cp = spawn(node, [file], {
      cwd: sampleRoot,
      stdio: ["pipe", "pipe", "ignore"],
      env,
    });

    cp.stdout.on("data", (chunk) => (output += chunk));
    cp.on("exit", () => {
      resolve(output.replace(/at:.*/g, "at:{STACK}"));
    });
  });
};
const files = readdirSync(sampleRoot).filter(
  (f) => extname(f) === ".js" && f !== "late_collect.js"
); // late collect will be checked separately

for (const f of files) {
  test(`testing file ${f}`, async ({ eq }) => {
    const actualOutput = await spawnTest(f);
    const outputFile = `../output/${[f.split(".")[0], "txt"].join(".")}`;
    const expectedOutput = await readFile(resolve(sampleRoot, outputFile), {
      encoding: "utf8",
    });
    eq(actualOutput, expectedOutput);
  });
}
