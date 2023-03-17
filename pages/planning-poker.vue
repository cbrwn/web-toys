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
            <div class="bg-green-400" v-on:click="createClicked">create room</div>
            <div>
              <div class="bg-blue-400" v-on:click="joinClicked">join room</div> <input type="text" class="dark:text-black"
                ref="roomId">
            </div>
          </div>

          <div v-else>
            <div>
              {{ roomId }}: {{ Object.keys(roomState.players).length }} players!
            </div>
            <div class="flex flex-col">
              name
              <div>
                <input type="text" class="text-black" v-model="playerName" placeholder="player name" size="10">
                <button class="bg-green-600 px-3 py-1 rounded-lg ml-3 cursor-pointer">yes</button>
              </div>
            </div>

            <div v-if="isRoomHost">
              <button class="bg-yellow-500 px-3 py-1 rounded-lg ml-3 cursor-pointer"
                v-on:click="revealClicked">reveal</button>
              <button class="bg-red-500 px-3 py-1 rounded-lg ml-3 cursor-pointer"
                v-on:click="resetClicked">reset</button>
            </div>

            <div class="mt-5">
              <div class="flex flex-row justify-center gap-3 mt-1">
                <PokerChoice v-for="(choice, index) in roomState.choices" :key="index" :selected="playerChoice==index" v-on:click="choiceClicked(index)">
                  {{ choice }}
                </PokerChoice>
              </div>
            </div>

            <div class="mt-5">
              players:
              <div class="flex flex-row justify-center gap-5 mt-1">
                <PokerPlayer v-for="(player, key) in roomState.players" :key="key" :player="player"
                  :revealed="roomState.revealed" :choices="roomState.choices" />
              </div>
            </div>
          </div>
        </div>

      </ContentContainer>
    </div>
  </div>
</template>

<script>
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
      roomState: null
    }
  },
  created() { document.title = 'planning poker'; },
  watch: {
    emitErrors: function (n, o) {
      console.log(n, o);
    }
  },
  mounted() {
    this.socket = this.$nuxtSocket({
      name: 'poker',
      channel: '/poker'
    });

    this.socket.on('connect', () => {
      console.log('connected');
      this.connectedState = 'connected';
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
      if(hostId == this.playerId) {
        this.isRoomHost = true;
      }
    });
  },
  methods: {
    createClicked() {
      this.socket.emit('createRoom', {}, (response) => {
        this.joinRoom(response.roomId);
      });
      console.log(this.emitErrors);
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

        this.socket.emit('getRoomState');
      })
    },

    choiceClicked(idx) {
      this.socket.emit('makeChoice', { choice: idx }, (response) => {
        if (response.status)
          this.playerChoice = response.choice;

        this.roomState.players[this.playerId].choice = this.playerChoice;
      })
    },

    revealClicked() {
      this.socket.emit('reveal', null, (response) => {
        if (response.status) {
          this.roomState.revealed = true;
        }
      });
    },

    resetState() {
      for(let player of Object.values(this.roomState.players)) {
        player.choice = -1;
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
    }
  },
  computed: {
  }
}
</script>