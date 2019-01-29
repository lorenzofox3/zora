
describe('add', function () {
  for (let i = 0; i < 4; i++) {
    it('should test',async function () {
      await new Promise(resolve => {
        setTimeout(()=>resolve(),20);
      });
      expect(Math.random() * 100 > 5).toBeTruthy();
    });
  }
});
