import { test } from 'zora';
import IsEvenComponent from '../../src/is-even-component.js';
import { shallowMount } from '../../util.js';

test('is-even component', ({ test }) => {
  test('isEvent getter should be true at first', (t) => {
    const comp = shallowMount(document.createElement('is-even'));
    t.eq(comp.isEven, true);
    t.eq(comp.value, 2);
  });
});
