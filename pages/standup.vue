<template>
    <div class="container mx-auto flex justify-center flex-grow">
        <div class="flex flex-col w-full items-center py-8 gap-y-3">
            <Header title="standup">
            </Header>
            <ContentContainer class="overflow-clip" :class="{ ['flex-grow']: roomState != null }">
                <StandupEmojiSpam ref="spam" />
                <!-- connecting -->
                <div v-if="connectedState == 'connecting'">
                    connecting to server...
                </div>

                <!-- disconnected :(  -->
                <div v-else-if="connectedState == 'disconnected'">
                    disconnected!! trying to reconnect..
                </div>

                <!-- we are connected! -->
                <div v-else class="w-full h-full z-50">
                    <!-- join/create -->
                    <JoinRoom v-if="roomState == null" :roomId="joinId" @update:roomId="val => joinId = val"
                        :onConfirm="() => joinOrCreateRoom(joinId)">
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
                                    v-model="tempName"
                                    v-on:keypress="event => { if (event.key == 'Enter') setName(tempName); }" />
                                <button class="bg-green-500 px-1 rounded-r-lg"
                                    :class="{ ['opacity-50 cursor-default']: tempName == myPlayer.name }"
                                    v-on:click="() => setName(tempName)">set name</button>
                            </div>
                        </div>

                        <!-- main content -->
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

                        <!-- people list! -->
                        <StandupPeople :people="roomState.players" :hostid="roomState.host" :myId="playerId"
                            :removePerson="(id) => removePerson(id)" ref="friends" />
                    </div>

                </div>

                <StandupNameModal v-if="roomState != null && !hasSetName" :setNameFn="(name) => setName(name)">
                    <h2 class="text-2xl">
                        welcome to standup :)
                    </h2>
                </StandupNameModal>
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

        // updates the entire roomstate object
        this.socket.on('updateRoomState', (roomState) => {
            this.roomState = roomState;

            if (roomState.state != 'running') {
                this.hasHadTurn = false;
            }

            // make sure old emoji stats don't show if running multiple standups in a row
            if (roomState.state != 'finished') {
                this.emojiStats = null;
            }
        });

        // sent when the order changes (e.g. a player finishes their turn)
        this.socket.on('updateOrder', (order) => {
            this.order = order;
        });

        // used to simply update the room's state without sending the whole roomState object
        this.socket.on('setRunningStatus', (state) => {
            this.roomState.state = state;

            // clear flags used while running once we're finished
            if (state != 'running') {
                this.hasHadTurn = false;
            }
        });

        // called when someone sends an emoji
        this.socket.on('react', (data) => {
            let emojiIndex = data.emoji;
            let personId = data.who;

            // grab emoji string based on the index
            let emoji = this.reactEmojis[emojiIndex];
            // pass emoji to the canvas for floating up
            this.$refs.spam.addEmoji(emoji);
            // pass emoji to player list to pop up their emoji
            this.$refs.friends.personReacted(personId, emoji);
        });

        // receiving emoji stats at the end of standup
        this.socket.on('sendStats', (stats) => {
            this.emojiStats = stats;
        });
    },
    computed: {
        // grabbin some player objects
        myPlayer() {
            return this.getPlayer(this.playerId);
        },
        getCurrentPlayer() {
            return this.getPlayer(this.order.now);
        },

        isHost() {
            return this.roomState.host == this.playerId;
        },

        // helpers for understanding the order object
        isMyTurn() {
            return this.order.now == this.playerId;
        },
        isUpNext() {
            return this.order.next == this.playerId;
        },

        // just using localstorage doesn't update this when we edit the storage,
        // so use an ugly local variable as well :()
        hasSetName() {
            return localStorage.getItem('hasSetName') || this.nameSetted;
        },
    },
    methods: {
        // lazily join/create a room
        // this could probably be done on the server instead but I'm also lazy
        joinOrCreateRoom(roomId, claimHost) {
            this.joinRoom(roomId, claimHost, (failId) => {
                this.createRoom(failId);
            });
        },

        // join a room + ability to force claim the host and do something on fail
        // onFail is used to create the room in joinOrCreateRoom
        joinRoom(roomId, claimHost, onFail) {
            let playerName = 'standupper';
            if (localStorage.getItem('name') != null) {
                playerName = localStorage.getItem('name');
            }
            this.socket.emit('join', { roomId: roomId, claimHost: claimHost, name: playerName }, (res) => {
                if (!res.status) {
                    if (onFail) {
                        onFail(roomId);
                    }
                    return;
                }

                this.playerId = res.id;
                this.tempName = res.name;

                localStorage.setItem('lastRoomId', roomId);
                localStorage.setItem('name', res.name);

                // make the current URL a copyable link
                // also serves to remove the claim host param from the URL
                window.history.replaceState(null, document.title, location.pathname + '?room=' + roomId);
            });
        },

        // makes a room and then joins it
        createRoom(roomId) {
            this.socket.emit('create', { roomName: roomId }, (response) => {
                if (response.status) {
                    this.joinRoom(response.roomId);
                }
            });
        },

        // helper to grab a player object by ID from the players list
        getPlayer(id) {
            let plr = this.roomState.players.find(p => p.id == id);
            return plr ? plr : { name: 'no one', comeBack: false };
        },

        // sets the player's name & stores it for future sessions
        setName(name) {
            this.tempName = name;
            this.socket.emit('setName', { name: name }, (res) => {
                if (res.status) {
                    // ensure the name in the textbox is updated
                    this.tempName = res.name;

                    this.myPlayer.name = res.name;

                    localStorage.setItem('name', res.name);
                    localStorage.setItem('hasSetName', true);
                    this.nameSetted = true;
                }
            });
        },

        // leaves the current room & makes sure the URL isn't pointing at the room anymore
        leaveRoom() {
            this.socket.emit('leave', {}, (res) => {
                if (res.status) {
                    this.roomState = null;
                    window.history.replaceState(null, document.title, location.pathname);
                }
            });
        },

        // player finishes their turn!
        // set a local flag to show a "you're done!" message
        finishedTurn() {
            this.socket.emit('next', {}, (res) => {
                this.hasHadTurn = true;
            });
        },

        // come back to this player! sends em to the end of the queue
        comeBack() {
            this.socket.emit('comeback', {}, (res) => {
                this.myPlayer.comeBack = true;
            });
        },

        // clicking on a reaction emoji!
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

        // host-only commands:

        // HOST: begin the standup!
        startStandup() {
            this.socket.emit('start', {}, (res) => {
                if (res.status) {
                    this.roomState.state = 'running';
                }
            });
        },
        // HOST: skip the current person
        skipOtherPlayer() {
            this.socket.emit('next', {}, (res) => { });
        },
        // HOST: reset the room after it finishes :D
        resetRoom() {
            this.socket.emit('reset', {}, (res) => {
                if (res.status) {
                    this.roomState.state = 'waiting';
                    this.hasHadTurn = false;
                }
            });
        },
        // HOST: add a ghost person
        addPerson(name) {
            this.socket.emit('addPerson', { name: name }, (res) => { });
        },
        // HOST: remove a ghost person
        removePerson(id) {
            this.socket.emit('removePerson', { id: id }, (res) => { });
        }
    }
}
</script>