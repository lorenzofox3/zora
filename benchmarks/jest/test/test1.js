
describe('add', function () {
  for (let i = 0; i < 10; i++) {
    it('should tester',async function () {
      await new Promise(resolve => {
        setTimeout(()=>resolve(),100);
      });
      expect(Math.random() * 100 > 10).toBeTruthy();
    });
  }
});
