<template>
  <div class="container mx-auto flex justify-center">
    <div class="flex flex-col w-full justify-center py-8 gap-y-3">
      <Header title="planning poker">
      </Header>
      <ContentContainer class="overflow-clip gap-4">
        <!--
          Connecting...
        -->
        <div v-if="connectedState == 'connecting'">
          connecting to server...
        </div>
        <!--
          Disconnected?????
        -->
        <div v-else-if="connectedState == 'disconnected'">
          disconnected!! trying to reconnect..
        </div>

        <!--
          We are connected.
        -->
        <div v-else>
          <!-- room selection/creation -->
          <div v-if="roomState == null" class="flex flex-col gap-4">
            <button class="bg-green-400 p-4 rounded-lg cursor-pointer transition-all hover:scale-105"
              v-on:click="createClicked">create room</button>
            <div class="flex flex-row items-center gap-4">
              <input type="text" size="10" class="dark:text-black text-4xl rounded-lg" ref="roomId"
                placeholder="give me code" />
              <button class="bg-blue-400 p-4 rounded-lg cursor-pointer transition-all hover:scale-105"
                v-on:click="joinClicked">join room</button>
            </div>
          </div>

          <div v-else class="flex flex-col items-center">
            <!-- room code -->
            <div class="flex flex-col items-center -mt-5 mb-3">
              <h2 class="flex flex-row items-center justify-center text-3xl cursor-pointer -mt-2 w-min"
                v-on:click="roomCodeClicked">
                {{ roomId }} <span class="text-2xl select-none">
                  <span v-if="showCopySuccess">
                    ✅
                  </span>
                  <span v-else>📋</span>
                  <span class="text-lg absolute transition-transform select-none"
                    :style="`transform: translate(${this.showCopySuccess ? '0%' : '-50%'}, 0%) scale(${this.showCopySuccess ? '1.0' : '0.0'});`">
                    copied url!
                  </span>
                </span>
              </h2>
              <p class="-mt-2 opacity-50">room code</p>
            </div>

            <!-- name -->
            <div class="flex flex-col mb-3">
              name
              <div>
                <input type="text" class="text-black text-lg h-full px-2 py-1 rounded-l-lg outline-none"
                  v-model="playerName" placeholder="player name" size="10"
                  v-on:keypress="event => { if (event.key == 'Enter') setName(); }">
                <button class="px-3 h-full rounded-r-lg bg-green-500 transition-all" v-on:click="setName"
                  :class="{ ['cursor-pointer']: nameEdited, ['cursor-default opacity-50']: !nameEdited }">
                  set
                </button>
              </div>
            </div>

            <!-- host controls -->
            <div v-if="isRoomHost" class="w-min">
              <div class="flex flex-row items-center mb-2">
                <div class="flex-grow h-0.5 bg-black/30 dark:bg-white/30"></div>
                <span class="text-sm mx-2">host</span>
                <div class="flex-grow h-0.5 bg-black/30 dark:bg-white/30"></div>
              </div>
              <div class="flex flex-row -mt-2">
                <PokerHostButton class="bg-yellow-500 rounded-l-lg 105">choices</PokerHostButton>
                <PokerHostButton class="bg-blue-400" v-on:click="revealClicked">reveal</PokerHostButton>
                <PokerHostButton class="bg-red-500 rounded-r-lg" v-on:click="resetClicked">reset</PokerHostButton>
              </div>
            </div>

            <!-- choices -->
            <div class="mt-5">
              <div class="flex flex-row justify-center gap-3 mt-1 transition-opacity"
                :class="{ ['opacity-50']: roomState.revealed && playerChoice == -1 }">
                <PokerChoice v-for="(choice, index) in roomState.choices" :key="index" :selected="playerChoice == index"
                  :cardClicked="() => choiceClicked(index)">
                  {{ choice }}
                </PokerChoice>
              </div>
            </div>

            <div class="mt-2 rounded-xl bg-black/5 px-3 pb-2">
              <div class="opacity-50 mb-1">
                vibes
              </div>
              <div class="flex flex-row gap-4">
                <PokerVibe v-for="(vibe, index) in confidenceValues" :key="index"
                  :selected="roomState.players[playerId].confidence == index" :desc="vibe.desc"
                  v-on:click="vibeClicked(index)">
                  {{ vibe.icon }}
                </PokerVibe>
              </div>
            </div>

            <div class="mt-5">
              players:
              <div class="flex flex-row justify-center gap-5 mt-1">
                <PokerPlayer v-for="(player, key) in roomState.players" :key="key" :player="player"
                  :revealed="roomState.revealed" :choices="roomState.choices" :vibes="confidenceValues" />
              </div>
            </div>
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
      roomId: '',
      playerId: '',
      playerName: '???',
      playerChoice: -1,
      isRoomHost: false,
      roomState: null,
      showCopySuccess: false,
      confidenceValues: [
        { icon: '🤔', desc: 'not sure' },
        { icon: '😎', desc: 'nailed it' },
        { icon: '🤠', desc: 'haha yes' },
      ]
    }
  },
  created() { document.title = 'planning poker'; },
  watch: {
    emitErrors: function (n, o) {
      console.log(n, o);
    }
  },
  beforeMount() {
    this.socket = io(document.location.origin);
    this.socket.on('connect', () => {
      console.log('connected');
      this.connectedState = 'connected';

      if (this.$route.query.room) {
        let roomString = this.$route.query.room;
        this.joinRoom(roomString);

        // clear ugly item query
        window.history.replaceState(null, document.title, location.pathname);
      }
    });

    this.socket.on('disconnect', (res) => {
      console.log('disconnected');
      this.connectedState = 'disconnected';
      this.roomState = null;
    });

    this.socket.on('updateRoomState', (res) => {
      console.log(res);
      this.roomState = res;
    });

    this.socket.on('revealGuesses', () => {
      console.log('revelaing from host');
      this.roomState.revealed = true;
    });

    this.socket.on('resetState', () => {
      console.log('resetting from host');
      this.resetState();
    });

    this.socket.on('newHost', (hostId) => {
      console.log('newHost');
      console.log(hostId);
      if (hostId == this.playerId) {
        this.isRoomHost = true;
      }
    });
  },
  methods: {
    createClicked() {
      this.socket.emit('createRoom', {}, (response) => {
        this.joinRoom(response.roomId);
      });
    },

    joinClicked() {
      this.joinRoom(this.$refs.roomId.value);
    },

    joinRoom(roomId) {
      this.socket.emit('joinRoom', { roomId: roomId }, (response) => {
        if (!response.status) {
          return;
        }
        this.roomId = response.roomId;
        this.isRoomHost = response.host;
        this.playerName = response.name;
        this.playerId = response.playerId;

        this.socket.emit('getRoomState', {}, (response) => {
          if (response.status) {
            this.roomState = response.roomState;
          }
        });
      })
    },

    choiceClicked(idx) {
      this.socket.emit('makeChoice', { choice: idx }, (response) => {
        if (response.status)
          this.playerChoice = response.choice;

        this.roomState.players[this.playerId].choice = this.playerChoice;
        this.roomState.players[this.playerId].originalChoice = response.originalChoice;
      })
    },

    setName() {
      this.socket.emit('changeName', this.playerName, (response) => {
        if (response.status) {
          this.playerName = response.newName;
          this.roomState.players[this.playerId].name = this.playerName;
        }
      });
    },

    revealClicked() {
      this.socket.emit('reveal', null, (response) => {
        if (response.status) {
          this.roomState.revealed = true;
        }
      });
    },

    resetState() {
      for (let player of Object.values(this.roomState.players)) {
        player.choice = -1;
        player.confidence = null;
        player.originalChoice = null;
      }
      this.roomState.revealed = false;
      this.playerChoice = -1;
    },

    resetClicked() {
      this.socket.emit('reset', null, (response) => {
        if (response.status) {
          this.resetState();
        }
      });
    },

    roomCodeClicked() {
      if (this.showCopySuccess) return;

      let currentLocation = location.protocol + '//' + location.host + location.pathname;
      let params = `?room=${this.roomId}`;
      navigator.clipboard.writeText(currentLocation + params);

      this.showCopySuccess = true;

      setTimeout(() => {
        this.showCopySuccess = false;
      }, 3000);
    },

    vibeClicked(index) {
      this.socket.emit('vibe', index, (response) => {
        if (response.status) {
          this.roomState.players[this.playerId].confidence = response.newVibe;
        }
      })
    }
  },
  computed: {
    nameEdited() {
      return this.playerName != this.roomState.players[this.playerId].name;
    }
  }
}
</script>