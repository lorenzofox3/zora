import { test } from 'zora';
import { setTimeout } from 'node:timers/promises';
import { counter } from './shared-state.js';

await test(`a third one`, async (t) => {
  await setTimeout(100);
  counter.value += 1;
  t.eq(counter.value, 3);
});
