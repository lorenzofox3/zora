export default (theme) =>
  ({ actual }) =>
    `expected ${theme.emphasis('"falsy"')} but got ${theme.emphasis(
      JSON.stringify(actual)
    )}`;
