import { test } from 'zora';

const wait = (time = 100) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });

test('root', async (t) => {
  t.ok(null);
  await wait();
  t.test('nested', async (t) => {
    t.ok(true);
    await wait();
    t.eq({ foo: 'bar' }, { foo: 'bar' });
  });

  t.eq('test', 'test');
});

test('some more', async (t) => {
  t.ok(true);
  await wait();
  t.eq(true, false);
});
