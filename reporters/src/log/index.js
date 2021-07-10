import {
  compose,
  defaultLogger,
  defaultSerializer,
  eventuallySetExitCode,
} from '../utils.js';

export default ({
  log = defaultLogger,
  serialize = defaultSerializer,
} = {}) => {
  const print = compose([log, serialize]);
  return async (messageStream) => {
    for await (const message of messageStream) {
      eventuallySetExitCode(message);
      print(message);
    }
  };
};
