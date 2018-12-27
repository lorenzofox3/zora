
const path = require('path');
const fs = require('fs');
const tests = fs.readdirSync(path.join(process.cwd(),'./benchmarks/zora/tester'));
for (let f of tests){
  require(path.join(process.cwd(),'./benchmarks/zora/tester/',f));
}
