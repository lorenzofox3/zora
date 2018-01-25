
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
