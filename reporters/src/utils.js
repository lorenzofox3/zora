import { MESSAGE_TYPE } from './protocol.js';

const isNode = typeof process !== 'undefined';

export const flatDiagnostic = ({ pass, description, ...rest }) => rest;

const createReplacer = () => {
  const visited = new Set();
  return (key, value) => {
    if (isObject(value)) {
      if (visited.has(value)) {
        return '[__CIRCULAR_REF__]';
      }

      visited.add(value);
    }

    if (typeof value === 'symbol') {
      return value.toString();
    }

    return value;
  };
};

const isObject = (candidate) =>
  typeof candidate === 'object' && candidate !== null;

const stringify = (value) => JSON.stringify(value, createReplacer());

export const defaultSerializer = stringify;

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

export const split = (separator) =>
  async function* (stream) {
    let buffer = '';
    for await (const chunk of stream) {
      const parts = (buffer + chunk.toString()).split(separator);
      buffer = parts.pop();
      yield* parts;
    }

    if (buffer) {
      yield buffer;
    }
  };

export const filter = (predicate) =>
  async function* (stream) {
    for await (const element of stream) {
      if (predicate(element)) {
        yield element;
      }
    }
  };

export const map = (mapFn) =>
  async function* (stream) {
    for await (const element of stream) {
      yield mapFn(element);
    }
  };
