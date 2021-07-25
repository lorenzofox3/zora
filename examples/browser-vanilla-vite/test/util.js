export const shallowMount = (comp) => {
  const wrapper = document.createElement('div');
  if (typeof comp === 'string') {
    wrapper.innerHTML = comp;
  } else {
    wrapper.appendChild(comp);
  }
  if (comp.connectedCallback) {
    comp.connectedCallback();
  }
  return wrapper.firstChild;
};

export const map = (mapFn) =>
  async function* (stream) {
    for await (const element of stream) {
      yield mapFn(element);
    }
  };

export const compose = (fns) => (arg) => fns.reduceRight((y, fn) => fn(y), arg);
