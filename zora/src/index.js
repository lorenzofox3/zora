import {createHarness} from './harness.js';

export {createHarness} from './harness.js';

export {Assert} from './test.js';

const harness = createHarness();

export const only = harness.only;

export const test = harness.test;

export const skip = harness.skip;

export default harness;

