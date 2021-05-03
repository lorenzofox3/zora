import { MESSAGE_TYPE } from './protocol.js';
import { isSkipped } from './utils.js';

const idSequence = () => {
  let id = 0;
  return () => ++id;
};

export const createCounter = () => {
  const nextId = idSequence();
  let success = 0;
  let failure = 0;
  let skip = 0;

  return Object.create(
    {
      increment(message) {
        const { type } = message;
        if (isSkipped(message)) {
          skip++;
        } else if (type === MESSAGE_TYPE.ASSERTION) {
          success += message.data.pass === true ? 1 : 0;
          failure += message.data.pass === false ? 1 : 0;
        }
      },
      nextId,
    },
    {
      success: {
        enumerable: true,
        get() {
          return success;
        },
      },
      failure: {
        enumerable: true,
        get() {
          return failure;
        },
      },
      skip: {
        enumerable: true,
        get() {
          return skip;
        },
      },
      total: {
        enumerable: true,
        get() {
          return skip + failure + success;
        },
      },
    }
  );
};
