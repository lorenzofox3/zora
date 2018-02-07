
const assert = require('assert');
describe('test file', function() {
  for(let i=0; i < 5;i++){
    it('test ' + i, function(done) {
      setTimeout(()=>{
        assert.ok(Math.random() * 100 > 10);
        done();
      },60);
    });
  }
});
