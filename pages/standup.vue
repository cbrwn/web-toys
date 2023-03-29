<template>
    <div class="container mx-auto flex justify-center flex-grow">
        <div class="flex flex-col w-full items-center py-8 gap-y-3">
            <Header title="standup">
            </Header>
            <ContentContainer class="overflow-clip" :class="{ ['flex-grow']: roomState != null }">
                <StandupEmojiSpam ref="spam" />
                <!-- Connecting -->
                <div v-if="connectedState == 'connecting'">
                    connecting to server...
                </div>

                <!-- Disconnected?????  -->
                <div v-else-if="connectedState == 'disconnected'">
                    disconnected!! trying to reconnect..
                </div>

                <div v-else class="w-full h-full z-50">
                    <!-- join/create -->
                    <JoinRoom v-if="roomState == null" :roomId="joinId" @update:roomId="val => joinId = val"
                        :onConfirm="joinClicked">
                        <h2 class="text-4xl -mt-5">welcome!</h2>
                        <p class="w-max opacity-50">enter your team's room name here to get started!</p>
                    </JoinRoom>

                    <!-- in room -->
                    <div class="flex flex-row justify-center w-full h-full" v-else>
                        <!-- top-left leave/name -->
                        <div class="absolute top-0 left-0">
                            <div class="m-2 flex flex-row">
                                <button class="bg-red-500 p-1 px-2 rounded-lg" v-on:click="leaveRoom">leave</button>

                                <input type="text" class="outline-none text-black px-2 rounded-l-lg ml-2" size="8"
                                    v-model="tempName" v-on:keypress="event => { if (event.key == 'Enter') setName(tempName); }" />
                                <button class="bg-green-500 px-1 rounded-r-lg"
                                    :class="{ ['opacity-50 cursor-default']: tempName == myPlayer.name }"
                                    v-on:click="() => setName(tempName)">set name</button>
                            </div>
                        </div>

                        <div class="flex-grow">
                            <!-- waiting for host -->
                            <div class="flex flex-col flex-grow pt-4" v-if="roomState.state == 'waiting'">
                                <h1 class="text-4xl">good morning!</h1>
                                <p class="opacity-40">waiting for host to start...</p>

                                <div v-if="isHost" class="mt-2 flex flex-col">
                                    <h2 class="text-2xl">^ that's you!!</h2>

                                    <div>
                                        <button class="bg-green-500 rounded-xl py-4 px-6" v-on:click="startStandup">start
                                            standup!</button>
                                    </div>
                                </div>

                                <p class="mt-5 opacity-50">pro tip: bookmark this url to come back to this room every
                                    morning!</p>

                                <StandupHostControls v-if="isHost" :state="roomState.state"
                                    :playerName="getCurrentPlayer.name" :addFn="(name) => addPerson(name)"
                                    :skipFn="skipOtherPlayer" />
                            </div>

                            <!-- standup running! -->
                            <div class="flex flex-col items-center h-full" v-else-if="roomState.state == 'running'">
                                <div class="flex-grow flex flex-col justify-center items-center">
                                    <p class="-mb-1">
                                        let's hear from...
                                    </p>
                                    <h1 class="text-4xl" :class="{ ['animate-bounce text-amber-500']: isMyTurn }">
                                        {{ getCurrentPlayer.name }}
                                    </h1>

                                    <div v-if="isUpNext" class="flex flex-row mt-3">
                                        <StandupJingle i="1" />
                                        <div>
                                            <p class="text-xl">get ready {{ myPlayer.name }}!!</p>
                                            <p class="-mt-2">you're up next!</p>
                                        </div>
                                        <StandupJingle i="0" />
                                    </div>

                                    <div v-if="isMyTurn">
                                        <p class="opacity-80">
                                            ^ that's you!
                                        </p>

                                        <button class="bg-green-500 px-10 py-5 rounded-xl mt-5"
                                            v-on:click="finishedTurn">all done!</button>
                                    </div>

                                    <StandupHostControls v-if="isHost" :state="roomState.state"
                                        :playerName="getCurrentPlayer.name" :addFn="(name) => addPerson(name)"
                                        :skipFn="skipOtherPlayer" />

                                </div>

                                <div class="flex flex-row gap-2 transition-opacity" :class="{ ['opacity-50']: !canReact }"
                                    v-if="!isMyTurn">
                                    <StandupEmojiPicker v-for="(emoji, index) in reactEmojis" :key="index"
                                        v-on:click="() => emojiClicked(index)">
                                        {{ emoji }}
                                    </StandupEmojiPicker>
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

                            <!-- standup finished -->
                            <StandupFinished v-else-if="roomState.state == 'finished'" :onResetClicked="resetRoom"
                                :isHost="isHost" :emojiStats="emojiStats" :getPlayerFn="getPlayer" />
                        </div>

                        <StandupPeople :people="roomState.players" :hostid="roomState.host" :myId="playerId"
                            :removePerson="(id) => removePerson(id)" ref="friends" />
                    </div>

                </div>

                <StandupNameModal v-if="roomState != null && !hasSetName" :setNameFn="(name) => setName(name)" />
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
            order: {},
            reactEmojis: ['😆', '😮', '😢', '🤯', '🥳', '👏', '🙌', '🏆', '🎷', '❤️'],
            canReact: true,
            nameSetted: false,
            emojiStats: null,
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

            if (this.$route.query.room) {
                let roomString = this.$route.query.room;
                this.joinOrCreateRoom(roomString, this.$route.query.host);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('disconnected');
            this.connectedState = 'disconnected';
        });

        this.socket.on('updateRoomState', (roomState) => {
            this.roomState = roomState;

            if (roomState.state != 'running') {
                this.hasHadTurn = false;
            }

            if (roomState.state != 'finished') {
                this.emojiStats = null;
            }
        });

        this.socket.on('updateOrder', (order) => {
            console.log('updateOrder', order);
            this.order = order;
        });

        this.socket.on('setRunningStatus', (state) => {
            console.log('setRunningStatus', state);
            this.roomState.state = state;

            if (state != 'running') {
                this.hasHadTurn = false;
            }
        });

        this.socket.on('react', (data) => {
            let emojiIndex = data.emoji;
            let personId = data.who;
            let emoji = this.reactEmojis[emojiIndex];
            this.$refs.spam.addEmoji(emoji);
            this.$refs.friends.personReacted(personId, emoji);
        });

        this.socket.on('sendStats', (stats) => {
            this.emojiStats = stats;
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
        },
        hasSetName() {
            return localStorage.getItem('hasSetName') || this.nameSetted;
        },
    },
    methods: {
        joinOrCreateRoom(roomId, claimHost) {
            this.joinRoom(roomId, claimHost, (failId) => {
                this.createRoom(failId);
            });
        },
        joinRoom(roomId, claimHost, onFail) {
            let playerName = 'standupper';
            if (localStorage.getItem('name') != null) {
                playerName = localStorage.getItem('name');
            }
            this.socket.emit('join', { roomId: roomId, claimHost: claimHost, name: playerName }, (res) => {
                if (!res.status) {
                    console.log(res.message);
                    if (onFail) {
                        onFail(roomId);
                    }
                    return;
                }

                this.playerId = res.id;
                this.tempName = res.name;

                localStorage.setItem('lastRoomId', roomId);
                localStorage.setItem('name', res.name);

                window.history.replaceState(null, document.title, location.pathname + '?room=' + roomId);
            });
        },
        createRoom(roomId) {
            this.socket.emit('create', { roomName: roomId }, (response) => {
                if (response.status) {
                    this.joinRoom(response.roomId);
                }
            });
        },

        joinClicked() { this.joinOrCreateRoom(this.joinId); },

        setName(name) {
            this.tempName = name;
            this.socket.emit('setName', { name: name }, (res) => {
                if (res.status) {
                    this.tempName = res.name;

                    this.myPlayer.name = res.name;

                    localStorage.setItem('name', res.name);
                    localStorage.setItem('hasSetName', true);
                    this.nameSetted = true;
                }
            });
        },

        leaveRoom() {
            this.socket.emit('leave', {}, (res) => {
                if (res.status) {
                    this.roomState = null;
                    window.history.replaceState(null, document.title, location.pathname);
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

        skipOtherPlayer() {
            this.socket.emit('next', {}, (res) => { });
        },

        resetRoom() {
            this.socket.emit('reset', {}, (res) => {
                if (res.status) {
                    this.roomState.state = 'waiting';
                    this.hasHadTurn = false;
                }
            });
        },

        emojiClicked(index) {
            this.socket.emit('react', { emoji: index }, (res) => {
                if (res.status) {
                    let emoji = this.reactEmojis[index];
                    this.$refs.spam.addEmoji(emoji);
                    this.$refs.friends.personReacted(this.playerId, emoji);

                    this.canReact = false;
                    setTimeout(() => this.canReact = true, 950);
                }
            });
        },

        addPerson(name) {
            this.socket.emit('addPerson', { name: name }, (res) => { });
        },

        removePerson(id) {
            this.socket.emit('removePerson', { id: id }, (res) => { });
        },

        getPlayer(id) {
            return this.roomState.players.find(p => p.id == id);
        }
    }
}
</script>