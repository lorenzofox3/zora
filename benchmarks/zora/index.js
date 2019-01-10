
const path = require('path');
const fs = require('fs');
const tests = fs.readdirSync(path.join(process.cwd(),'./benchmarks/zora/test'));
for (let f of tests){
  require(path.join(process.cwd(),'./benchmarks/zora/test/',f));
}
