import { hold, report } from 'zora';
import { map } from './util.js';
hold();

const passThroughReporter = map((message) => message);

const createSocketReporter = (opts = {}) =>
  new Promise((resolve, reject) => {
    const socket = new WebSocket('ws://localhost:8000');
    // Connection opened
    socket.addEventListener('open', function (event) {
      resolve(async (stream) => {
        sendObj({ type: 'RUN_START' });
        for await (const message of stream) {
          sendObj(message);
        }
        sendObj({ type: 'RUN_END' });
      });
    });

    function sendObj(obj) {
      return socket.send(JSON.stringify(obj));
    }

    socket.addEventListener('error', (err) => {
      console.error(err);
      reject(err);
    });
  });

const devToolReporter = async (stream) => {
  for await (const message of stream) {
    if (message.type === 'ASSERTION') {
      if (message.data.pass === true) {
        console.log(message);
      } else {
        console.error(message);
      }
    } else {
      console.info(message);
    }
  }
};

Promise.all(
  Object.values(import.meta.glob('./specs/*.js')).map((spec) => spec())
)
  .then(() =>
    report({
      reporter: passThroughReporter,
    })
  )
  .then(async (messageStream) => {
    const [st1, st2] = tee(messageStream);
    const socketReporter = await createSocketReporter();

    socketReporter(st2);
    return devToolReporter(st1);
  });

function iteratorToStream(iterator) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

async function* streamAsyncIterator(stream) {
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

function tee(iterator) {
  return iteratorToStream(iterator).tee().map(streamAsyncIterator);
}
