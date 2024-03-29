import { test } from 'zora';
import { setTimeout } from 'node:timers/promises';
import { counter } from './shared-state.js';

await test(`a second one`, async (t) => {
  await setTimeout(200);
  counter.value += 1;
  t.eq(counter.value, 2);
});
