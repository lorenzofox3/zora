
const assert = require('assert');
describe('test file', function() {
  for(let i=0; i < 8;i++){
    it('test ' + i, function(done) {
      setTimeout(()=>{
        assert.ok(Math.random() * 100 > 5);
        done();
      },40);
    });
  }
});
