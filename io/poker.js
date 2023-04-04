const fakelish = require("fakelish");

let rooms = {};

function getPlayerInfo(plr) {
  return {
    name: plr.name || "???",
    choice: plr.choice,
    originalChoice: plr.originalChoice,
    confidence: plr.confidence,
  };
}

async function createRoom(roomId) {
  rooms[roomId] = {
    players: [],
    choices: ["0", "1", "2", "3", "5", "8", "13", "21", "34"],
    host: "",
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
        host: this.host
      };
    },

    removePlayer: function (plr, socket) {
      plr.room = null;

      this.players = this.players.filter((player) => {
        return player.id !== plr.id;
      });

      if (plr.id == this.host && this.players.length > 0) {
        this.host = this.players[0].id;
        socket.to(roomId).emit("newHost", this.host);
      }
    },

    resetState: function () {
      for (let plr of this.players) {
        plr.choice = -1;
        plr.originalChoice = null;
        plr.confidence = null;
      }
      this.revealed = false;
    },
  };

  console.log(`Created room ${roomId}`);
}

// routine reporting on rooms and players
setInterval(() => {
  // get time in hh:mm format
  let time = new Date().toLocaleTimeString();
  console.log(`poker status - @ ${time}`);

  let roomCount = Object.keys(rooms).length;
  let emptyRoomCount = 0;
  let playerCount = 0;
  for (let roomId in rooms) {
    playerCount += rooms[roomId].players.length;

    if (rooms[roomId].players.length === 0) {
      emptyRoomCount++;
    }
  }

  console.log(`  => ${roomCount} rooms (${emptyRoomCount} empty)`);
  console.log(`  => ${playerCount} players`);
}, 5 * 60 * 1000);

let poker = {
  setup: function (io) {
    console.log("setting up poker :D");
    const ns = io.of("/poker");
    ns.on("connection", (socket) => {
      console.log("poker connection!");

      socket.on("joinRoom", async (req, callback) => {
        if (socket.client.room != null) {
          return callback({
            status: false,
            message: "you are already in a room!",
          });
        }

        let roomId = req.roomId;

        if (rooms[req.roomId] == null) {
          await createRoom(roomId);
        }

        socket.join(roomId);
        socket.client.room = roomId;
        socket.client.choice = -1;
        socket.client.originalChoice = null;
        socket.client.confidence = null;
        socket.client.name = req.name;
        rooms[roomId].players.push(socket.client);

        let isHost = false;
        if (rooms[roomId].players.length === 1 || req.claimHost) {
          rooms[roomId].host = socket.client.id;
          isHost = true;
        }

        let roomState = rooms[roomId].getRoomState();
        socket.to(roomId).emit("updateRoomState", roomState);

        socket.once("disconnect", () => {
          rooms[socket.client.room].removePlayer(socket.client, socket);
          socket
            .to(roomId)
            .emit("updateRoomState", rooms[roomId].getRoomState());
        });

        return callback({
          status: true,
          roomId: roomId,
          name: socket.client.name,
          playerId: socket.client.id,
        });
      });

      socket.on("leaveRoom", (req, callback) => {
        let roomId = socket.client.room;
        rooms[roomId].removePlayer(socket.client, socket);
        socket.to(roomId).emit("updateRoomState", rooms[roomId].getRoomState());
      });

      socket.on("getRoomState", (req, callback) => {
        if (socket.client.room == null) {
          return callback({ status: false, message: "you are not in a room!" });
        }

        return callback({
          status: true,
          roomState: rooms[socket.client.room].getRoomState(),
        });
      });

      socket.on("makeChoice", (req, callback) => {
        if (socket.client.room == null) {
          return callback({ status: false, message: "you are not in a room!" });
        }

        if (rooms[socket.client.room].revealed && socket.client.choice == -1) {
          return callback({
            status: false,
            message: "you can't vote after revealing!",
          });
        }

        if (
          rooms[socket.client.room].revealed &&
          socket.client.choice != -1 &&
          socket.client.originalChoice == null
        ) {
          socket.client.originalChoice = socket.client.choice;
        }

        socket.client.choice = req.choice;
        let roomState = rooms[socket.client.room].getRoomState();
        socket.to(socket.client.room).emit("updateRoomState", roomState);

        return callback({
          status: true,
          choice: socket.client.choice,
          originalChoice: socket.client.originalChoice,
        });
      });

      socket.on("reveal", (req, callback) => {
        if (socket.client.room == null) {
          return callback({ status: false, message: "you are not in a room!" });
        }

        if (rooms[socket.client.room].revealed) {
          return callback({ status: false, message: "room already revealed!" });
        }

        if (rooms[socket.client.room].host !== socket.client.id) {
          return callback({
            status: false,
            message: "you are not the host of this room!",
          });
        }

        rooms[socket.client.room].revealed = true;
        socket.to(socket.client.room).emit("revealGuesses");

        return callback({ status: true });
      });

      socket.on("reset", (req, callback) => {
        if (socket.client.room == null) {
          return callback({ status: false, message: "you are not in a room!" });
        }

        if (rooms[socket.client.room].host !== socket.client.id) {
          return callback({
            status: false,
            message: "you are not the host of this room!",
          });
        }

        rooms[socket.client.room].resetState();
        socket.to(socket.client.room).emit("resetState");

        return callback({ status: true });
      });

      socket.on("changeName", (newName, callback) => {
        socket.client.name = newName;
        socket
          .to(socket.client.room)
          .emit("updateRoomState", rooms[socket.client.room].getRoomState());

        return callback({ status: true, newName: newName });
      });

      socket.on("vibe", (vibeIndex, callback) => {
        if (socket.client.room == null) {
          return callback({ status: false, message: "you are not in a room!" });
        }

        if (socket.client.choice == -1) {
          return callback({
            status: false,
            message: "you have not made a choice yet!",
          });
        }

        if (socket.client.confidence === vibeIndex) {
          socket.client.confidence = null;
        } else {
          socket.client.confidence = vibeIndex;
        }

        socket
          .to(socket.client.room)
          .emit("updateRoomState", rooms[socket.client.room].getRoomState());

        return callback({ status: true, newVibe: socket.client.confidence });
      });

      socket.on("newChoices", (choices, callback) => {
        if (socket.client.room == null) {
          return callback({ status: false, message: "you are not in a room!" });
        }

        if (rooms[socket.client.room].host !== socket.client.id) {
          return callback({
            status: false,
            message: "you are not the host of this room!",
          });
        }

        if (rooms[socket.client.room].revealed) {
          return callback({ status: false, message: "room already revealed!" });
        }

        let room = rooms[socket.client.room];

        room.choices = choices;
        socket
          .to(socket.client.room)
          .emit("updateRoomState", room.getRoomState());
        return callback({ status: true, choices: room.choices });
      });
    }); // ns.on(connect)
  },
};

export default poker;
