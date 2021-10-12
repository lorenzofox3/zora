import { unknownMessage } from './protocol.js';

export const createJSONParser = ({ strictMode = false }) =>
  async function* (lineStream) {
    for await (const line of lineStream) {
      try {
        yield JSON.parse(line);
      } catch (e) {
        if (strictMode) {
          throw new Error(`could not parse line "${line}"`);
        } else {
          yield unknownMessage({ message: line });
        }
      }
    }
  };
