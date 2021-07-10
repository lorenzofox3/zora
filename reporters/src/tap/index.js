import { assertionMessage, MESSAGE_TYPE } from '../protocol.js';
import {
  defaultLogger,
  defaultSerializer,
  eventuallySetExitCode,
  filter,
} from '../utils.js';
import { createCounter } from '../counter.js';
import { createWriter } from './writer.js';

const isNotTestEnd = ({ type }) => type !== MESSAGE_TYPE.TEST_END;
const filterOutTestEnd = filter(isNotTestEnd);

const writeMessage = ({ writer, nextId }) => {
  const writerTable = {
    [MESSAGE_TYPE.ASSERTION](message) {
      return writer.printAssertion(message, { id: nextId() });
    },
    [MESSAGE_TYPE.TEST_START](message) {
      if (message.data.skip) {
        const skippedAssertionMessage = assertionMessage({
          description: message.data.description,
          pass: true,
        });
        return writer.printAssertion(skippedAssertionMessage, {
          comment: 'SKIP',
          id: nextId(),
        });
      }
      return writer.printTestStart(message);
    },
    [MESSAGE_TYPE.ERROR](message) {
      writer.printBailOut();
      throw message.data.error;
    },
  };
  return (message) => writerTable[message.type]?.(message);
};

export default ({ log = defaultLogger, serialize = defaultSerializer } = {}) =>
  async (messageStream) => {
    const writer = createWriter({
      log,
      serialize,
    });
    const counter = createCounter();
    const write = writeMessage({ writer, nextId: counter.nextId });
    const stream = filterOutTestEnd(messageStream);

    writer.printHeader();
    for await (const message of stream) {
      counter.increment(message);
      write(message);
      eventuallySetExitCode(message);
    }
    writer.printSummary(counter);
  };
