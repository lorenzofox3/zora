const isNode = typeof process !== "undefined";

export const flatDiagnostic = ({ pass, description, ...rest }) => rest;

const stringifySymbol = (key, value) =>
  typeof value === "symbol" ? value.toString() : value;

export const defaultSerializer = (value) =>
  JSON.stringify(value, stringifySymbol);

export const defaultLogger = (value) => console.log(value);

export const isFailing = (message) =>
  message.type === "ASSERTION" && !message.data.pass;

export const eventuallySetExitCode = (message) => {
  if (isNode && isFailing(message)) {
    process.exitCode = 1;
  }
};
