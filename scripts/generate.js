const fs = require('fs');
const path = require('path');

const filesCount = 8;
const testCount = 8;
const waitTime = 60;

const zoraCode = `
const plan = require('../../../dist/index.js')();
for (let i = 0; i < ${testCount}; i++) {
  plan.test('test ' + i, async function (assert) {
    await new Promise(resolve => {
      setTimeout(()=>resolve(),${waitTime});
    });
    assert.ok(Math.random() * 100 > 10);
  });
}
module.exports = plan;
`;

const avaCode = `
const test = require('ava');
for (let i = 0; i < ${testCount}; i++) {
  test('test ' + i, async function (assert) {
    await new Promise(resolve => {
      setTimeout(()=>resolve(),${waitTime});
    });
    assert.truthy(Math.random() * 100 > 10);
  });
}
`;

const mochaCode = `
const assert = require('assert');
describe('test file', function() {
  for(let i=0; i < ${testCount};i++){
    it('test ' + i, function(done) {
      setTimeout(()=>{
        assert.ok(Math.random() * 100 > 10);
        done();
      },${waitTime});
    });
  }
});
`;

const tapeCode = `
const test = require('tape');
for (let i = 0; i < ${testCount}; i++) {
  test('test ' + i, function  (assert) {
    setTimeout(()=>{
      assert.ok(Math.random() * 100 > 10);
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
      expect(Math.random() * 100 > 10).toBeTruthy();
    });
  }
});
`;

const tapeIndex = `
const path = require('path');
const fs = require('fs');
const tests = fs.readdirSync(path.join(process.cwd(),'./benchmarks/tape/test'));
for (let f of tests){
  require(path.join(process.cwd(),'./benchmarks/tape/test/',f));
}
`;
const zoraIndex = `
const zora = require('../../dist/index.js');
const masterPlan = zora();
const path = require('path');
const fs = require('fs');
const tests = fs.readdirSync(path.join(process.cwd(),'./benchmarks/zora/test'));
for (let f of tests){
  const subPlan = require(path.join(process.cwd(),'./benchmarks/zora/test/',f));
  masterPlan.test(subPlan);
}

masterPlan.run();
`;


for (let i = 1; i <= filesCount; i++) {
	const zoraPath = path.join(process.cwd(), '/benchmarks/zora/test/', 'test' + i + '.js');
	const avaPath = path.join(process.cwd(), '/benchmarks/ava/test/', 'test' + i + '.js');
	const mochaPath = path.join(process.cwd(), '/benchmarks/mocha/test/', 'test' + i + '.js');
	const tapePath = path.join(process.cwd(), '/benchmarks/tape/test/', 'test' + i + '.js');
	const jestPath = path.join(process.cwd(), '/benchmarks/jest/test/', 'test' + i + '.js');
	fs.writeFileSync(zoraPath, zoraCode);
	fs.writeFileSync(avaPath, avaCode);
	fs.writeFileSync(mochaPath, mochaCode);
	fs.writeFileSync(tapePath, tapeCode);
	fs.writeFileSync(jestPath, jestCode);
	fs.writeFileSync(path.join(process.cwd(), '/benchmarks/tape/index.js'), tapeIndex);
	fs.writeFileSync(path.join(process.cwd(), '/benchmarks/zora/index.js'), zoraIndex);
}