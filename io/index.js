import socketIO from 'socket.io';
import poker from './poker';
import standup from './standup';

export default function (a, nuxt) {
  console.log('io module begin');

  nuxt.hook('listen', (httpServer) => {
    console.log('io: hooking listen event');
    const io = socketIO(httpServer);

    poker.setup(io);
    standup.setup(io);
  });
}