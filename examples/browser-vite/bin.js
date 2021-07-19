import { createServer } from 'vite';
import { on } from 'events';
import WebSocket from 'ws';
import { createDiffReporter } from 'zora-reporters';

(async () => {
  const reporter = createDiffReporter();

  const fileServer = await createServer({
    server: {
      port: 3000,
    },
  });

  const webSocketServer = new WebSocket.Server({
    port: 8000,
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
