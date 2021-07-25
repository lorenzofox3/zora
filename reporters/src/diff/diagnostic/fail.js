export default (theme) =>
  ({ description }) =>
    `expected ${theme.emphasis(
      'fail'
    )} not to be called, but was called as ${theme.emphasis(
      JSON.stringify(description)
    )}`;
