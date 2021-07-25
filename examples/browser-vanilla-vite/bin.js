import { createServer } from 'vite';
import { pathToFileURL } from 'url';
import WebSocket from 'ws';
import { createDiffReporter } from 'zora-reporters';
import { compose, map } from './test/util.js';

const fileServerPort = process.env.FILE_SERVER_POIRT || 3000;
const webSocketPort = process.env.WS_SERVER_PORT || 8000;

const locateOnFS = map((message) => {
  if (message.data?.pass !== false) {
    return message;
  }

  const { at, ...restOfData } = message.data;
  const { pathname } = new URL(at);
  const onFS = new URL(pathname, pathToFileURL(process.cwd()));

  return {
    ...message,
    data: {
      ...restOfData,
      at: onFS,
    },
  };
});

(async () => {
  const reporter = compose([createDiffReporter(), locateOnFS]);

  const fileServer = await createServer({
    server: {
      port: fileServerPort,
    },
  });

  const webSocketServer = new WebSocket.Server({
    port: webSocketPort,
  });

  webSocketServer.on('connection', (ws) => {
    console.debug('client connected');
    reporter(streamRunFromSocket(ws));
  });

  webSocketServer.on('close', function close() {
    console.debug('client disconnected');
  });

  await fileServer.listen();
})();

async function* streamRunFromSocket(socket) {
  const buffer = [];
  let done = false;
  let release;
  try {
    socket.on('message', listener);

    while (true) {
      if (done) {
        break;
      }
      const message = buffer.shift();
      if (message) {
        yield message;
      } else {
        await new Promise((resolve) => (release = resolve));
      }
    }
  } finally {
    socket.off('message', listener);
  }

  function listener(message) {
    const messageObj = JSON.parse(message);

    if (messageObj.type === 'RUN_END') {
      done = true;
    }

    buffer.push(messageObj);
    release?.();
  }
}
