import { MESSAGE_TYPE } from './protocol.js';

const isNode = typeof process !== 'undefined';

export const flatDiagnostic = ({ pass, description, ...rest }) => rest;

const stringifySymbol = (key, value) =>
  typeof value === 'symbol' ? value.toString() : value;

export const defaultSerializer = (value) =>
  JSON.stringify(value, stringifySymbol);

export const defaultLogger = (value) => console.log(value);

export const isAssertionFailing = (message) =>
  message.type === MESSAGE_TYPE.ASSERTION && !message.data.pass;

export const isSkipped = (message) =>
  message.type === MESSAGE_TYPE.TEST_START && message.data.skip;

export const eventuallySetExitCode = (message) => {
  if (isNode && isAssertionFailing(message)) {
    process.exitCode = 1;
  }
};

export const compose = (fns) => (arg) =>
  fns.reduceRight((arg, fn) => fn(arg), arg);
