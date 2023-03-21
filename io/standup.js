let rooms = {};

function createRoom(name) {
    rooms[name] = {
        people: [],
        order: [],
        host: '',
        state: 'waiting',
        id: name,

        join: function (socket) {
            socket.join(this.id);
            this.people.push(socket.client);
            socket.client.room = this.id;

            if (this.people.length === 1) {
                this.host = socket.client.id;
            }

            if (this.state == 'running') {
                this.order.push(this.people.length - 1);
            }
        },

        leave: function (socket) {
            socket.leave(this.id);
            let index = this.people.indexOf(socket.client);
            this.people.splice(index, 1);
            socket.client.room = null;

            if (this.host === socket.client.id) {
                this.host = (this.people.length > 0) ? this.people[0].id : '';
            }

            // update order of indices if running
            if (this.order.length > 0) {
                let orderIndex = this.order.indexOf(index);

                if (orderIndex > -1) {
                    this.order.splice(orderIndex, 1);
                }

                for (let i = 0; i < this.order.length; i++) {
                    if (this.order[i] > index) {
                        this.order[i]--;
                    }
                }
            }

            if (this.people.length === 0) {
                this.reset();
            }
        },

        sendRoomState: function (socket) {
            let players = [];
            for (let player of this.people) {
                players.push({
                    id: player.id,
                    name: player.name,
                    comeBack: player.comeBack,
                });
            }

            socket.emit('updateRoomState', {
                id: this.id,
                host: this.host,
                state: this.state,
                players: players,
            });
        },

        start: function () {
            this.state = 'running';

            let allIndices = [];
            for (let i = 0; i < this.people.length; i++) {
                this.people[0].comeBack = false;
                allIndices.push(i);
            }

            this.order = allIndices.sort(() => Math.random() - 0.5);
        },

        stop: function () {
            this.state = 'finished';
            this.order = [];
        },

        reset: function () {
            this.state = 'waiting';
            this.order = [];
        },

        broadcastOrder: function (ns) {
            let nowId = '';
            let nextId = '';
            if (this.order.length > 0) {
                nowId = this.people[this.order[0]].id;
            }
            if (this.order.length > 1) {
                nextId = this.people[this.order[1]].id;
            }
            console.log('broadcasting order to namespace');
            ns.to(this.id).emit('updateOrder', {
                now: nowId,
                next: nextId,
            });
        },

        next: function () {
            if (this.order.length > 0) {
                this.order.shift();
            }

            if (this.order.length == 0) {
                this.state = 'finished';
            }
        },

        comeBack: function (client) {
            console.log('comeBack: ' + client.id);
            let index = this.people.indexOf(client);
            let orderIndex = this.order.indexOf(index);

            console.log('orderIndex: ' + orderIndex);
            console.log('index: ' + index);

            console.log('before', this.order);
            if (orderIndex > -1) {
                this.order.splice(orderIndex, 1);
                this.order.push(index);
            }
            console.log('after', this.order);

            return orderIndex <= 1;
        }
    };
}

let standup = {
    setup: function (io) {
        console.log('setting up standup :D');

        const ns = io.of('/standup');
        ns.on('connection', (socket) => {
            console.log('standup connection!');

            socket.client.name = 'stander upper';

            socket.on('create', (data, callback) => {
                if (data.roomName.length === 0) {
                    return callback({ status: false, message: "room name is required!" });
                }

                if (rooms.hasOwnProperty(data.roomName)) {
                    return callback({ status: false, message: "room already exists!" });
                }

                createRoom(data.roomName);

                return callback({ status: true, roomId: data.roomName });
            });

            socket.on('join', (data, callback) => {
                if (!rooms.hasOwnProperty(data.roomId)) {
                    return callback({ status: false, message: "room doesn't exist!" });
                }

                let room = rooms[data.roomId];
                socket.client.name = data.name;
                console.log(data);
                console.log(socket.client.name);
                room.join(socket);

                room.sendRoomState(socket);
                room.sendRoomState(socket.to(room.id));

                if (room.state == 'running') {
                    room.broadcastOrder(ns);
                }

                socket.once('disconnect', () => {
                    let roomId = socket.client.room;
                    rooms[roomId].leave(socket);
                    rooms[roomId].sendRoomState(socket.to(roomId));
                });

                return callback({ status: true, roomId: data.roomId, name: socket.client.name, id: socket.client.id });
            });

            socket.on('setName', (data, callback) => {
                socket.client.name = data.name;

                if (socket.client.room != null && rooms.hasOwnProperty(socket.client.room)) {
                    rooms[socket.client.room].sendRoomState(socket.to(socket.client.room));
                }

                return callback({ status: true, name: socket.client.name });
            });

            socket.on('leave', (data, callback) => {
                if (socket.client.room == null) {
                    return callback({ status: false, message: "you are not in a room!" });
                }

                let room = rooms[socket.client.room];
                room.leave(socket);
                room.sendRoomState(socket.to(room.id));

                // disconnect just removes them from the room, don't need that if they leave
                socket.removeAllListeners('disconnect');

                return callback({ status: true });
            });

            socket.on('start', (data, callback) => {
                if (socket.client.room == null) {
                    return callback({ status: false, message: "you are not in a room!" });
                }

                if (rooms[socket.client.room].state !== 'waiting') {
                    return callback({ status: false, message: "room is already in progress!" });
                }

                if (rooms[socket.client.room].host !== socket.client.id) {
                    return callback({ status: false, message: "you are not the host of this room!" });
                }

                let room = rooms[socket.client.room];
                room.start();
                socket.to(socket.client.room).emit('setRunningStatus', room.state);
                room.broadcastOrder(ns);

                return callback({ status: true });
            });

            socket.on('cancel', (data, callback) => {
                if (socket.client.room == null) {
                    return callback({ status: false, message: "you are not in a room!" });
                }

                if (rooms[socket.client.room].state !== 'waiting') {
                    return callback({ status: false, message: "room isn't in progress!" });
                }

                if (rooms[socket.client.room].host !== socket.client.id) {
                    return callback({ status: false, message: "you are not the host of this room!" });
                }

                rooms[socket.client.room].stop();
                rooms[socket.client.room].sendRoomState(socket.to(socket.client.room));

                return callback({ status: true });
            });

            socket.on('reset', (data, callback) => {
                if (socket.client.room == null) {
                    return callback({ status: false, message: "you are not in a room!" });
                }

                if (rooms[socket.client.room].host !== socket.client.id) {
                    return callback({ status: false, message: "you are not the host of this room!" });
                }

                rooms[socket.client.room].reset();
                rooms[socket.client.room].sendRoomState(socket.to(socket.client.room));

                return callback({ status: true });
            });

            socket.on('next', (data, callback) => {
                if (socket.client.room == null) {
                    return callback({ status: false, message: "you are not in a room!" });
                }

                let room = rooms[socket.client.room];
                let wasPlayer = socket.client.id == room.people[room.order[0]].id;
                let wasHost = room.host === socket.client.id;

                if (wasPlayer || wasHost) {
                    room.next();

                    if (room.state == 'finished') {
                        ns.to(socket.client.room).emit('setRunningStatus', room.state);
                    } else {
                        room.broadcastOrder(ns);
                    }
                } else {
                    return callback({ status: false, message: "it's not your turn!" });
                }

                return callback({ status: true });
            });

            socket.on('comeback', (data, callback) => {
                if (socket.client.room == null) {
                    return callback({ status: false, message: "you are not in a room!" });
                }

                if (socket.client.comeBack) {
                    return callback({ status: false });
                }

                let room = rooms[socket.client.room];
                let wasUpNext = room.comeBack(socket.client);
                socket.client.comeBack = true;

                if (wasUpNext) {
                    room.broadcastOrder(ns);
                }

                return callback({ status: true });
            });

            socket.on('react', (data, callback) => {
                if (socket.client.room == null) {
                    return callback({ status: false, message: "you are not in a room!" });
                }

                socket.to(rocket.client.room).emit('react', data.emoji);

                return callback({ status: true, emoji: data.emoji });
            });
        });
    }
};

export default standup;