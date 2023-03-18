import http from 'http'
import socketIO from 'socket.io'

const fakelish = require('fakelish');

let rooms = {};

function getPlayerInfo(plr) {
	return {
		name: plr.name || "???",
		choice: plr.choice,
		originalChoice: plr.originalChoice,
	}
}

async function createRoom() {
	let roomId = '';
	do {
		roomId = await fakelish.generateFakeWord(4, 8);
	} while (rooms.hasOwnProperty(roomId));
	rooms[roomId] = {
		players: [],
		choices: ['0', '1', '2', '3', '5', '8', '13', '21', '34'],
		host: '',
		revealed: false,

		getPlayerInfos: function () {
			let plrs = {};
			this.players.forEach((player) => {
				plrs[player.id] = getPlayerInfo(player);
			});
			return plrs;
		},

		getRoomState: function () {
			let infos = this.getPlayerInfos();
			return {
				roomId: roomId,
				choices: this.choices,
				players: infos,
				revealed: this.revealed,
			};
		},

		removePlayer: function (plr, socket) {
			plr.room = null;

			this.players = this.players.filter((player) => {
				return player.id !== plr.id;
			});

			if (plr.id == this.host && this.players.length > 0) {
				this.host = this.players[0].id;
				socket.to(roomId).emit('newHost', this.host);
			}
		},

		resetState: function () {
			for (let plr of this.players) {
				plr.choice = -1;
				plr.originalChoice = null;
			}
			this.revealed = false;
		}
	};

	console.log(`Created room ${roomId}`);

	return roomId;
}

export default function (a, nuxt) {
  console.log('io module :)');
  nuxt.hook('listen', (httpServer) => {
    console.log('listen hook...');
    const io = socketIO(httpServer);

    io.on('connection', (socket) => {
      console.log('socket connection!');

      socket.on('createRoom', async (s, callback) => {
        let roomId = await createRoom();
        callback({ roomId });
      });

      socket.on('joinRoom', async (req, callback) => {
        if (socket.client.room != null) {
          return callback({ status: false, message: "you are already in a room!" });
        }

        if (rooms[req.roomId] == null) {
          return callback({ status: false, message: "room doesn't exist!" });
        }

        let roomId = req.roomId;
        socket.join(roomId);
        socket.client.room = roomId;
        socket.client.choice = -1;
        socket.client.originalChoice = null;
        socket.client.name = await fakelish.generateFakeWord(4, 7);
        rooms[roomId].players.push(socket.client);

        let isHost = false;
        if (rooms[roomId].players.length === 1) {
          rooms[roomId].host = socket.client.id;
          isHost = true;
        }

        let roomState = rooms[roomId].getRoomState();
        socket.to(roomId).emit('updateRoomState', roomState);

        socket.once('disconnect', () => {
          rooms[socket.client.room].removePlayer(socket.client, socket);
          socket.to(roomId).emit('updateRoomState', rooms[roomId].getRoomState());
        });

        return callback({
          status: true,
          roomId: roomId,
          host: isHost,
          name: socket.client.name,
          playerId: socket.client.id,
        });
      });

      socket.on('leaveRoom', (req, callback) => {
        let roomId = socket.client.room;
        rooms[roomId].removePlayer(socket.client, socket);
        socket.to(roomId).emit('updateRoomState', rooms[roomId].getRoomState());
      });

      socket.on('getRoomState', (req, callback) => {
        if (socket.client.room == null) {
          return callback({ status: false, message: "you are not in a room!" });
        }

        return callback({ status: true, roomState: rooms[socket.client.room].getRoomState() });
      });

      socket.on('makeChoice', (req, callback) => {
        if (socket.client.room == null) {
          return callback({ status: false, message: "you are not in a room!" });
        }

        if (rooms[socket.client.room].revealed && socket.client.choice == -1) {
          return callback({ status: false, message: "you can't vote after revealing!" });
        }

        if (rooms[socket.client.room].revealed && socket.client.choice != -1 && socket.client.originalChoice == null) {
          socket.client.originalChoice = socket.client.choice;
        }

        socket.client.choice = req.choice;
        let roomState = rooms[socket.client.room].getRoomState();
        socket.to(socket.client.room).emit('updateRoomState', roomState);

        return callback({ status: true, choice: socket.client.choice, originalChoice: socket.client.originalChoice });
      });

      socket.on('reveal', (req, callback) => {
        if (socket.client.room == null) {
          return callback({ status: false, message: "you are not in a room!" });
        }

        if (rooms[socket.client.room].revealed) {
          return callback({ status: false, message: "room already revealed!" });
        }

        if (rooms[socket.client.room].host !== socket.client.id) {
          return callback({ status: false, message: "you are not the host of this room!" });
        }

        rooms[socket.client.room].revealed = true;
        socket.to(socket.client.room).emit('revealGuesses');

        return callback({ status: true });
      });

      socket.on('reset', (req, callback) => {
        if (socket.client.room == null) {
          return callback({ status: false, message: "you are not in a room!" });
        }

        if (rooms[socket.client.room].host !== socket.client.id) {
          return callback({ status: false, message: "you are not the host of this room!" });
        }

        rooms[socket.client.room].resetState();
        socket.to(socket.client.room).emit('resetState');

        return callback({ status: true });
      });

      socket.on('changeName', (newName, callback) => {
        socket.client.name = newName;
        socket.to(socket.client.room).emit('updateRoomState', rooms[socket.client.room].getRoomState());

        return callback({ status: true, newName: newName });
      });
    }); // io.on(connect)
  });
  /*
  this.nuxt.hook('render:before', (renderer) => {
    const server = http.createServer(this.nuxt.renderer.app);
    const io = socketIO(server);

    // overwrite nuxt.server.listen()
    this.nuxt.server.listen = (port, host) => new Promise(resolve => {
      server.listen(port || 3000, host || 'localhost', resolve);
    });
    // close this server on 'close' event
    this.nuxt.hook('close', () => new Promise(server.close));

    // Add socket.io events
  })*/
}