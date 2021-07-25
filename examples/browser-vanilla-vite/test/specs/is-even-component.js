import { test } from 'zora';
import IsEvenComponent from '../../src/is-even-component.js';
import { shallowMount } from '../util.js';

test('is-even component', ({ test }) => {
  test('isEven getter should be true at first', (t) => {
    const comp = shallowMount(document.createElement('is-even'));
    t.eq(comp.isEven, true);
    t.eq(comp.value, 42, 'default value should be 42');
  });

  test('isEven getter should be true when the value is even, false otherwise', (t) => {
    const comp = shallowMount(document.createElement('is-even'));
    t.eq(comp.isEven, true);
    t.eq(comp.value, 2);
    comp.value = 1;
    t.eq(comp.isEven, false);
  });
});
