const hasSome = (label) => (counter) => counter[label] > 0;
const hasFailure = hasSome('failure');
const hasSkip = hasSome('skip');

const getPad =
  ({ total }) =>
  (number) =>
    String(number).padStart(String(total).length + 2);

export default ({ theme }) => {
  return {
    fail(counter) {
      const padNumber = getPad(counter);
      const label = `FAIL:${padNumber(counter.failure)}`;
      return hasFailure(counter)
        ? theme.errorBadge(label)
        : theme.disable(label);
    },
    pass(counter) {
      const padNumber = getPad(counter);
      const label = `PASS:${padNumber(counter.success)}`;
      return hasFailure(counter)
        ? theme.disable(label)
        : theme.successBadge(label);
    },
    skip(counter) {
      const padNumber = getPad(counter);
      const label = `SKIP:${padNumber(counter.skip)}`;
      return hasSkip(counter) ? theme.skipBadge(label) : theme.disable(label);
    },
    total(counter) {
      return theme.header(`TOTAL:  ${counter.total}`);
    },
  };
};
