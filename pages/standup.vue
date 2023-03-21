<template>
    <div class="container mx-auto flex justify-center flex-grow">
        <div class="flex flex-col w-full items-center py-8 gap-y-3">
            <Header title="standup">
            </Header>
            <ContentContainer class="overflow-clip" :class="{ ['flex-grow']: roomState != null }">
                <!-- Connecting -->
                <div v-if="connectedState == 'connecting'">
                    connecting to server...
                </div>

                <!-- Disconnected?????  -->
                <div v-else-if="connectedState == 'disconnected'">
                    disconnected!! trying to reconnect..
                </div>

                <div v-else class="w-full h-full">
                    <!-- join/create -->
                    <div v-if="roomState == null" class="flex justify-center items-center">
                        <div class="flex flex-col w-min">
                            <input type="text" class="text-black" v-model="joinId" />
                            <button v-on:click="joinClicked">join room</button>
                            <button v-on:click="createClicked">create room</button>
                        </div>
                    </div>

                    <!-- in room -->
                    <div class="flex flex-row justify-center w-full h-full" v-else>
                        <!-- top-left leave/name -->
                        <div class="absolute top-0 left-0">
                            <div class="m-2 flex flex-row">
                                <button class="bg-red-500 p-1 px-2 rounded-lg" v-on:click="leaveRoom">leave</button>

                                <input type="text" class="outline-none text-black px-2 rounded-l-lg ml-2" size="8"
                                    v-model="tempName" v-on:keypress="event => { if (event.key == 'Enter') setName(); }" />
                                <button class="bg-green-500 px-1 rounded-r-lg" v-on:click="setName">set name</button>
                            </div>
                        </div>

                        <div class="flex-grow">
                            <div class="flex flex-col pt-4" v-if="roomState.state == 'waiting'">
                                <h1 class="text-4xl">good morning!</h1>
                                <p class="opacity-40">waiting for host to start...</p>

                                <div v-if="isHost" class="mt-2 flex flex-col">
                                    <h2 class="text-2xl">^ that's you!!</h2>

                                    <div>
                                        <button class="bg-green-500 rounded-xl py-4 px-6" v-on:click="startStandup">start
                                            standup!</button>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col h-full" v-else-if="roomState.state == 'running'">
                                <div class="flex-grow flex flex-col justify-center items-center">
                                    <p class="-mb-1">
                                        let's hear from...
                                    </p>
                                    <h1 class="text-4xl" :class="{ ['animate-bounce text-amber-500']: isMyTurn }">
                                        {{ getCurrentPlayer.name }}
                                    </h1>

                                    <div v-if="isMyTurn">
                                        <p class="opacity-80">
                                            ^ that's you!
                                        </p>

                                        <button class="bg-green-500 px-10 py-5 rounded-xl mt-5"
                                            v-on:click="finishedTurn">all done!</button>
                                    </div>
                                </div>
                                <div v-if="isUpNext" class="animate-pulse">
                                    you're up next!!
                                </div>

                                <div class="flex flex-col items-center mt-5">
                                    <div v-if="!myPlayer.comeBack && !hasHadTurn">
                                        <p class="opacity-60">
                                            need a minute to step away?
                                        </p>
                                        <button class="bg-amber-600 w-fit text-white py-2 px-5 rounded-lg"
                                            v-on:click="comeBack">come back to
                                            me</button>
                                    </div>
                                    <div v-else-if="(!isUpNext && !isMyTurn) && !hasHadTurn">
                                        <p class="opacity-60">
                                            we'll come back to you at the end!
                                        </p>
                                    </div>
                                    <div v-else-if="hasHadTurn">
                                        <p class="opacity-60">
                                            you're done!<br />
                                            stick around and listen to what everyone else is up to!
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col h-full items-center justify-center" v-else-if="roomState.state == 'finished'">
                                <h1 class="text-4xl">that's everyone!</h1>
                                <p>thanks for using the standup-o-matic 5000</p>
                                <p>have a good day everyone!!</p>

                                <div v-if="isHost" class="mt-5">
                                    <button class="bg-amber-500 p-4 rounded-lg" v-on:click="resetRoom">reset room</button>
                                </div>
                            </div>
                        </div>

                        <StandupPeople :people="roomState.players" :hostid="roomState.host" />
                    </div>

                </div>
            </ContentContainer>
        </div>
    </div>
</template>

<script>
import io from 'socket.io-client'

export default {
    layout: 'default',
    data() {
        return {
            connectedState: 'connecting',
            roomState: null,
            joinId: '',
            tempName: '',
            playerId: '',
            hasHadTurn: false,
            order: {}
        }
    },
    created() {
        document.title = 'standup';
    },
    beforeMount() {
        this.joinId = localStorage.getItem('lastRoomId');
        this.socket = io(document.location.origin + '/standup');
        this.socket.on('connect', () => {
            console.log('connected');
            this.connectedState = 'connected';
        });

        this.socket.on('disconnect', () => {
            console.log('disconnected');
            this.connectedState = 'disconnected';
        });

        this.socket.on('updateRoomState', (roomState) => {
            this.roomState = roomState;

            if(roomState.state != 'running') {
                this.hasHadTurn = false;
            }
        });

        this.socket.on('updateOrder', (order) => {
            console.log('updateOrder', order);
            this.order = order;
        });

        this.socket.on('setRunningStatus', (state) => {
            console.log('setRunningStatus', state);
            this.roomState.state = state;

            if(state != 'running') {
                this.hasHadTurn = false;
            }
        });
    },
    computed: {
        myPlayer() {
            let plr = this.roomState.players.find(p => p.id == this.playerId);
            return plr ? plr : { name: 'oh no something went wrong', comeBack: false };
        },
        isHost() {
            return this.roomState.host == this.playerId;
        },
        getCurrentPlayer() {
            let plr = this.roomState.players.find(p => p.id == this.order.now);
            return plr ? plr : { name: 'no one', comeBack: false };
        },
        isMyTurn() {
            return this.order.now == this.playerId;
        },
        isUpNext() {
            return this.order.next == this.playerId;
        }
    },
    methods: {
        joinRoom(roomId) {
            let playerName = 'standupper';
            if (localStorage.getItem('name') != null) {
                playerName = localStorage.getItem('name');
            }
            this.socket.emit('join', { roomId: roomId, name: playerName }, (res) => {
                if (!res.status) {
                    console.log(res.message);
                }

                this.playerId = res.id;
                this.tempName = res.name;

                localStorage.setItem('lastRoomId', roomId);
                localStorage.setItem('name', res.name);
            });
        },
        createRoom(roomId) {
            this.socket.emit('create', { roomName: roomId }, (response) => {
                if (response.status) {
                    this.joinRoom(response.roomId);
                }
            });
        },

        joinClicked() { this.joinRoom(this.joinId); },
        createClicked() { this.createRoom(this.joinId); },

        setName() {
            this.socket.emit('setName', { name: this.tempName }, (res) => {
                if (res.status) {
                    this.tempName = res.name;

                    this.myPlayer.name = res.name;

                    localStorage.setItem('name', res.name);
                }
            });
        },

        leaveRoom() {
            this.socket.emit('leave', {}, (res) => {
                if (res.status) {
                    this.roomState = null;
                }
            });
        },

        startStandup() {
            this.socket.emit('start', {}, (res) => {
                if (res.status) {
                    this.roomState.state = 'running';
                }
            });
        },

        comeBack() {
            console.log('come back');
            this.socket.emit('comeback', {}, (res) => {
                console.log(res);
                this.myPlayer.comeBack = true;
            });
        },

        finishedTurn() {
            console.log('finished turn');
            this.socket.emit('next', {}, (res) => {
                this.hasHadTurn = true;
            });
        },

        resetRoom() {
            this.socket.emit('reset', {}, (res) => {
                if (res.status) {
                    this.roomState.state = 'waiting';
                    this.hasHadTurn = false;
                }
            });
        }
    }
}
</script>