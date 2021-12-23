import { test } from 'zora';
import { newTestMessage, testEndMessage } from './protocol.js';
import { createJSONParser } from './message-parser.js';

const bufferStream = async (stream) => {
  const buffer = [];
  for await (const m of stream) {
    buffer.push(m);
  }
  return buffer;
};

test('parse message stream in fault tolerant mode', (t) => {
  t.test(`should parse zora protocol messages`, async (t) => {
    const messageStream = async function* () {
      yield JSON.stringify(newTestMessage({ description: 'test start' }));
      yield JSON.stringify(
        testEndMessage({ description: 'test start', executionTime: 666 })
      );
    };

    const parse = createJSONParser({ strictMode: false });
    const buffer = await bufferStream(parse(messageStream()));
    t.eq(buffer, [
      { type: 'TEST_START', data: { description: 'test start' } },
      {
        type: 'TEST_END',
        data: { description: 'test start', executionTime: 666 },
      },
    ]);
  });

  t.test(
    `should emit a "unknown" message for line the parser can not parse`,
    async (t) => {
      const messageStream = async function* () {
        yield JSON.stringify(newTestMessage({ description: 'test start' }));
        yield 'whatever';
        yield JSON.stringify(
          testEndMessage({ description: 'test start', executionTime: 666 })
        );
      };

      const parse = createJSONParser({ strictMode: false });
      const buffer = await bufferStream(parse(messageStream()));
      t.eq(buffer, [
        { type: 'TEST_START', data: { description: 'test start' } },
        { type: 'UNKNOWN', data: { message: 'whatever' } },
        {
          type: 'TEST_END',
          data: { description: 'test start', executionTime: 666 },
        },
      ]);
    }
  );
});

test('parse message stream in strict mode mode', (t) => {
  t.test(`should parse zora protocol messages`, async (t) => {
    const messageStream = async function* () {
      yield JSON.stringify(newTestMessage({ description: 'test start' }));
      yield JSON.stringify(
        testEndMessage({ description: 'test start', executionTime: 666 })
      );
    };

    const parse = createJSONParser({ strictMode: true });
    const buffer = await bufferStream(parse(messageStream()));
    t.eq(buffer, [
      { type: 'TEST_START', data: { description: 'test start' } },
      {
        type: 'TEST_END',
        data: { description: 'test start', executionTime: 666 },
      },
    ]);
  });

  t.test(
    `should emit a "unknown" message for line the parser can not parse`,
    async (t) => {
      const messageStream = async function* () {
        yield JSON.stringify(newTestMessage({ description: 'test start' }));
        yield 'whatever';
        yield JSON.stringify(
          testEndMessage({ description: 'test start', executionTime: 666 })
        );
      };

      const parse = createJSONParser({ strictMode: true });
      try {
        const buffer = await bufferStream(parse(messageStream()));
        t.fail('should not reach that code');
      } catch (e) {
        t.eq(e.message, 'could not parse line "whatever"');
      }
    }
  );
});
