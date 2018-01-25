
describe('add', function () {
  for (let i = 0; i < 8; i++) {
    it('should test',async function () {
      await new Promise(resolve => {
        setTimeout(()=>resolve(),60);
      });
      expect(Math.random() * 100 > 10).toBeTruthy();
    });
  }
});
