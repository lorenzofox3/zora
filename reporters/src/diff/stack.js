export const createStack = () => {
  const items = [];
  const stack = {
    [Symbol.iterator]() {
      return items[Symbol.iterator]();
    },
    push(item) {
      items.push(item);
      return stack;
    },
    pop() {
      return items.pop();
    },
  };
  return stack;
};
