import arg from "arg";
import { writeFileSync } from "fs";
import { join } from "path";

const range = (number = 1) =>
  Array.from({
    length: number,
  }).map((_, index) => index + 1);

const {
  ["--files"]: filesCount = 10,
  ["--tests"]: testCount = 8,
  ["--idle"]: waitTime = 30,
} = arg({
  "--files": Number,
  "--tests": Number,
  "--idle": Number,
});

const errorRate = 5;

const zoraCode = `
import {test} from 'zora';
for (let i = 0; i < ${testCount}; i++) {
  test('test ' + i, async function (assert) {
    await new Promise(resolve => {
      setTimeout(()=>resolve(),${waitTime});
    });
    assert.ok(Math.random() * 100 > ${errorRate});
  });
};
`;

const avaCode = `
import test from 'ava';
for (let i = 0; i < ${testCount}; i++) {
  test('test ' + i, async function (assert) {
    await new Promise(resolve => {
      setTimeout(()=>resolve(),${waitTime});
    });
    assert.truthy(Math.random() * 100 > ${errorRate});
  });
}
`;

const mochaCode = `
import assert from 'assert';
describe('test file', function() {
  for(let i=0; i < ${testCount};i++){
    it('test ' + i, function(done) {
      setTimeout(()=>{
        assert.ok(Math.random() * 100 > ${errorRate});
        done();
      },${waitTime});
    });
  }
});
`;

const tapeCode = `
import test from 'tape';
for (let i = 0; i < ${testCount}; i++) {
  test('test ' + i, function  (assert) {
    setTimeout(()=>{
      assert.ok(Math.random() * 100 > ${errorRate});
      assert.end();
    },${waitTime});
  });
}
`;

const jestCode = `
describe('add', function () {
  for (let i = 0; i < ${testCount}; i++) {
    it('should test',async function () {
      await new Promise(resolve => {
        setTimeout(()=>resolve(),${waitTime});
      });
      expect(Math.random() * 100 > ${errorRate}).toBeTruthy();
    });
  }
});
`;

const uvuCode = `
import { test } from 'uvu';
import * as assert from 'uvu/assert';

for (let i = 0; i < ${testCount}; i++) {
  test('test ' + i, async function () {
    await new Promise(resolve => {
      setTimeout(()=>resolve(),${waitTime});
    });
    assert.ok(Math.random() * 100 > ${errorRate});
  });
}

test.run();
`;
const zoraIndex = `
${range(filesCount)
  .map((i) => `import './test/test${i}.js'`)
  .join(";\n")}
`;

for (let i = 1; i <= filesCount; i++) {
  const zoraPath = join(
    process.cwd(),
    "/suites/zora/test/",
    "test" + i + ".js"
  );
  const avaPath = join(process.cwd(), "/suites/ava/test/", "test" + i + ".js");
  const mochaPath = join(
    process.cwd(),
    "/suites/mocha/test/",
    "test" + i + ".js"
  );
  const tapePath = join(
    process.cwd(),
    "/suites/tape/test/",
    "test" + i + ".js"
  );
  const jestPath = join(
    process.cwd(),
    "/suites/jest/__tests__/",
    "test" + i + ".js"
  );
  const uvuPath = join(process.cwd(), "/suites/uvu/test", "test" + i + ".js");
  writeFileSync(zoraPath, zoraCode);
  writeFileSync(avaPath, avaCode);
  writeFileSync(mochaPath, mochaCode);
  writeFileSync(tapePath, tapeCode);
  writeFileSync(jestPath, jestCode);
  writeFileSync(uvuPath, uvuCode);
  writeFileSync(join(process.cwd(), "/suites/zora/index.js"), zoraIndex);
}
