export default (theme) =>
  ({ actual }) =>
    `expected ${theme.emphasis('"truthy"')} but got ${theme.emphasis(
      actual === '' ? '""' : actual
    )}`;
