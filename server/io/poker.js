const fakelish = require('fakelish');

let rooms = {};

function getPlayerInfo(plr) {
	return {
		name: plr.name || "???",
		choice: plr.choice,
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
			}
			this.revealed = false;
		}
	};

	console.log(`Created room ${roomId}`);

	return roomId;
}

export default function Svc(socket, io) {
	return Object.freeze({
		async createRoom() {
			let roomId = await createRoom();
			return { roomId };
		},

		async joinRoom(req) {
			if (socket.client.room != null) {
				return { status: false, message: "you are already in a room!" };
			}

			if (rooms[req.roomId] == null) {
				return { status: false, message: "room doesn't exist!" };
			}

			let roomId = req.roomId;
			socket.join(roomId);
			socket.client.room = roomId;
			socket.client.choice = -1;
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

			return {
				status: true,
				roomId: roomId,
				host: isHost,
				name: socket.client.name,
				playerId: socket.client.id,
			};
		},

		leaveRoom() {
			let roomId = socket.client.room;
			rooms[roomId].removePlayer(socket.client, socket);
			socket.to(roomId).emit('updateRoomState', rooms[roomId].getRoomState());
		},

		getRoomState() {
			if (socket.client.room == null) {
				return { status: false, message: "you are not in a room!" };
			}

			socket.emit('updateRoomState', rooms[socket.client.room].getRoomState());

			return { status: true };
		},

		makeChoice(req) {
			if (socket.client.room == null) {
				return { status: false, message: "you are not in a room!" };
			}

			socket.client.choice = req.choice;
			let roomState = rooms[socket.client.room].getRoomState();
			socket.to(socket.client.room).emit('updateRoomState', roomState);

			return { status: true, choice: socket.client.choice };
		},

		reveal() {
			if (socket.client.room == null) {
				return { status: false, message: "you are not in a room!" };
			}

			if (rooms[socket.client.room].revealed) {
				return { status: false, message: "room already revealed!" };
			}

			if (rooms[socket.client.room].host !== socket.client.id) {
				return { status: false, message: "you are not the host of this room!" };
			}

			rooms[socket.client.room].revealed = true;
			socket.to(socket.client.room).emit('revealGuesses');

			return { status: true };
		},

		reset() {
			if (socket.client.room == null) {
				return { status: false, message: "you are not in a room!" };
			}

			if (rooms[socket.client.room].host !== socket.client.id) {
				return { status: false, message: "you are not the host of this room!" };
			}

			rooms[socket.client.room].resetState();
			socket.to(socket.client.room).emit('resetState');

			return { status: true };
		},

		changeName(newName) {
			socket.client.name = newName;
			socket.to(socket.client.room).emit('updateRoomState', rooms[socket.client.room].getRoomState());

			return { status: true, newName: newName };
		}
	})
}