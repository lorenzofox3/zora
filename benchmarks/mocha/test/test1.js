
const assert = require('assert');
describe('test file', function() {
  for(let i=0; i < 4;i++){
    it('test ' + i, function(done) {
      setTimeout(()=>{
        assert.ok(Math.random() * 100 > 5);
        done();
      },20);
    });
  }
});
