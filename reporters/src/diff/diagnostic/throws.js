export default (theme) => (m) => {
  const { actual, expected } = m;
  return expected !== void 0
    ? `expected the error thrown to match ${theme.emphasis(
        expected
      )} but it matched ${theme.emphasis(actual)}`
    : `expected ${theme.emphasis('to throw')} but it did not`;
};
