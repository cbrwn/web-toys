<template>
  <div class="container mx-auto flex justify-center">
    <div class="flex flex-col w-full justify-center py-8 gap-y-3">
      <Header title="planning poker"> </Header>
      <ContentContainer class="overflow-clip gap-4">
        <!--
          Connecting...
        -->
        <div v-if="connectedState == 'connecting'">connecting to server...</div>
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
            <!-- join/create -->
            <JoinRoom
              v-if="roomState == null"
              :roomId="joinId"
              @update:roomId="(val) => (joinId = val)"
              :onConfirm="() => joinRoom(joinId)"
            >
            </JoinRoom>
          </div>

          <div v-else class="flex flex-col items-center">
            <!-- room code -->
            <div class="flex flex-col items-center -mt-5 mb-3">
              <h2
                class="flex flex-row items-center justify-center text-3xl cursor-pointer -mt-2"
                v-on:click="roomCodeClicked"
              >
                {{ roomId }}
                <span class="text-2xl select-none">
                  <span v-if="showCopySuccess"> ✅ </span>
                  <span v-else>📋</span>
                  <span
                    class="text-lg absolute transition-transform select-none"
                    :style="`transform: translate(${
                      this.showCopySuccess ? '0%' : '-50%'
                    }, 0%) scale(${this.showCopySuccess ? '1.0' : '0.0'});`"
                  >
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
                <input
                  type="text"
                  class="text-black text-lg h-full px-2 py-1 rounded-l-lg outline-none"
                  v-model="playerName"
                  placeholder="player name"
                  size="10"
                  v-on:keypress="
                    (event) => {
                      if (event.key == 'Enter') setName(playerName);
                    }
                  "
                />
                <button
                  class="px-3 h-full rounded-r-lg bg-green-500 text-black transition-all"
                  v-on:click="() => setName(playerName)"
                  :class="{
                    ['cursor-pointer']: nameEdited,
                    ['cursor-default opacity-50']: !nameEdited,
                  }"
                >
                  set
                </button>

                <button
                  class="bg-red-500 h-full px-3 rounded-xl text-black ml-2 transition-all hover:scale-105 hover:-translate-y-1"
                  v-on:click="() => (myPlayer.role = 'voter')"
                  v-if="myPlayer.role != 'observer'"
                >
                  role
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
                <PokerHostButton
                  class="rounded-l-lg 105"
                  :class="{
                    ['bg-yellow-500']: !editChoicesMode,
                    ['bg-green-500']: editChoicesMode,
                  }"
                  v-on:click="toggleChoiceEditing"
                  :disable="roomState.revealed"
                >
                  {{ editChoicesMode ? "apply" : "choices" }}
                </PokerHostButton>
                <PokerHostButton
                  class="bg-blue-400"
                  v-on:click="revealClicked"
                  :disable="editChoicesMode || roomState.revealed"
                  >reveal
                </PokerHostButton>
                <PokerHostButton
                  class="bg-red-500 rounded-r-lg"
                  v-on:click="resetClicked"
                  >reset</PokerHostButton
                >
              </div>
            </div>

            <!-- choices -->
            <div
              class="mt-5"
              v-if="myPlayer.role != 'observer' || editChoicesMode"
            >
              <div
                class="flex flex-wrap justify-center items-center gap-3 mt-1 transition-opacity"
                :class="{
                  ['opacity-50']: roomState.revealed && myPlayer.choice == -1,
                }"
              >
                <PokerChoice
                  v-for="(choice, index) in roomState.choices"
                  :item="choice"
                  :key="index"
                  :selected="myPlayer.choice == index"
                  :cardClicked="() => choiceClicked(index)"
                  :onRemove="() => removeChoice(index)"
                  :onEdited="(val) => editChoice(index, val)"
                  :onMove="(d) => moveChoice(index, d)"
                  :editMode="editChoicesMode && isRoomHost"
                />

                <PokerChoice
                  v-if="editChoicesMode"
                  :cardClicked="addChoice"
                  item="+"
                />
              </div>
            </div>

            <div
              class="mt-2 rounded-xl px-3 text-gray-400 dark:text-gray-500"
              v-if="myPlayer.role != 'observer'"
            >
              <div class="opacity-50 mb-1">vibes</div>
              <div
                class="flex flex-row gap-4 transition-opacity"
                :class="{ ['opacity-30']: myPlayer.choice == -1 }"
              >
                <PokerVibe
                  v-for="(vibe, index) in confidenceValues"
                  :key="index"
                  :selected="roomState.players[playerId].confidence == index"
                  :desc="vibe.desc"
                  v-on:click="vibeClicked(index)"
                >
                  {{ vibe.icon }}
                </PokerVibe>
              </div>
            </div>

            <div class="flex flex-wrap justify-center gap-5 mt-5">
              <div v-for="(role, index) in existingRoles" :key="index">
                <div
                  v-if="roleExists(role)"
                  class="flex flex-col gap-2"
                  :class="role == 'observer' ? 'self-end' : ''"
                >
                  {{ role }}
                  <div class="flex flex-row gap-2">
                    <PokerPlayer
                      v-for="(player, key) in getPlayersWithRole(role)"
                      :key="key"
                      :idx="getPlayerDisplayIndex(player)"
                      :player="player"
                      :revealed="roomState.revealed"
                      :choices="roomState.choices"
                      :vibes="confidenceValues"
                      :observer="role == 'observer'"
                      :host="isRoomHost"
                      :observeFn="(id) => toggleObserver(id)"
                      :roleBg="roleColours[player.role]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <NameModal
          v-if="roomState != null && !hasSetName"
          :setNameFn="(name) => setName(name)"
          defaultName="pokerer"
        >
          <h2 class="text-2xl">welcome to planning poker!</h2>
        </NameModal>

        <div
          class="flex justify-center items-center fixed left-0 top-0 w-full h-full bg-black/50 z-50"
          v-else-if="roomState != null && myPlayer.role == 'voter'"
        >
          <div
            class="flex flex-col items-center bg-slate-300 dark:bg-slate-600 w-1/3 h-min rounded-3xl py-5"
          >
            <h2 class="text-4xl">select your role!</h2>

            <div class="flex flex-col mt-4 gap-2 w-1/2">
              <button
                v-for="(role, index) in availableRoles"
                :key="index"
                class="p-1 px-2 text-black rounded-xl transition-all hover:scale-110"
                :class="roleColours[role]"
                v-on:click="() => changeRole(index)"
              >
                {{ role }}
              </button>
            </div>
          </div>
        </div>

        <PokerConsensusDisplay
          :isConsensus="isConsensus"
          :isMegaConsensus="isMegaConsensus"
          :voteCount="voteCount"
          :consensusValue="roomState?.choices[consensusValue]"
        />
      </ContentContainer>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";

export default {
  layout: "default",
  data() {
    return {
      connectedState: "connecting",
      joinId: "",
      roomId: "",
      playerId: "",
      playerName: "???",
      nameSetted: false,
      roomState: null,
      showCopySuccess: false,
      editChoicesMode: false,
      voteCount: 0,
      confidenceValues: [
        { icon: "🤔", desc: "not sure" },
        { icon: "😎", desc: "nailed it" },
        { icon: "🤠", desc: "haha yes" },
      ],
      availableRoles: ["engineer", "xd", "design", "production"],
      roleColours: {
        engineer: "bg-emerald-400",
        xd: "bg-pink-400",
        design: "bg-blue-400",
        production: "bg-amber-300",
        voter: "bg-blue-500",
        observer: "bg-gray-400",
      },
    };
  },
  created() {
    document.title = "planning poker";
  },
  beforeUnmount() {
    this.socket?.disconnect();
  },
  beforeMount() {
    this.joinId = localStorage.getItem("lastPokerRoomId");

    this.socket = io(document.location.origin + "/poker");
    this.socket.on("connect", () => {
      console.log("connected");
      this.connectedState = "connected";

      if (this.$route.query.room) {
        let roomString = this.$route.query.room;
        this.joinRoom(roomString, this.$route.query.host);
      }
    });

    this.socket.on("disconnect", (res) => {
      console.log("disconnected");
      this.connectedState = "disconnected";
      this.roomState = null;
    });

    this.socket.on("updateRoomState", (res) => {
      this.roomState = res;
    });

    this.socket.on("revealGuesses", () => {
      console.log("revelaing from host");
      this.roomState.revealed = true;
    });

    this.socket.on("resetState", () => {
      console.log("resetting from host");
      this.resetState();
      this.voteCount++;
    });

    this.socket.on("newHost", (hostId) => {
      console.log("newHost", hostId);
      if (this.roomState) {
        this.roomState.host = hostId;
      }
    });

    this.socket.on("updatePlayerRole", (res) => {
      if (this.roomState == null) return;

      this.roomState.players[res.playerId].role = res.role;

      if (res.playerId == this.playerId && res.role == "voter") {
        if (localStorage.getItem("pokerRole") !== undefined) {
          this.changeRole(localStorage.getItem("pokerRole"));
        }
      }
    });
  },
  methods: {
    joinRoom(roomId, claimHost) {
      let playerName = "pokerer";
      if (localStorage.getItem("name") != null) {
        playerName = localStorage.getItem("name");
      }

      this.socket.emit(
        "joinRoom",
        { roomId: roomId, name: playerName, claimHost: claimHost },
        (response) => {
          if (!response.status) {
            return;
          }

          this.roomId = response.roomId;
          this.playerName = response.name;
          this.playerId = response.playerId;

          localStorage.setItem("lastPokerRoomId", roomId);
          localStorage.setItem("name", response.name);

          if (localStorage.getItem("pokerRole") !== undefined) {
            this.changeRole(localStorage.getItem("pokerRole"));
          }

          window.history.replaceState(
            null,
            document.title,
            location.pathname + "?room=" + roomId
          );

          this.socket.emit("getRoomState", {}, (response) => {
            if (response.status) {
              this.roomState = response.roomState;
            }
          });
        }
      );
    },

    choiceClicked(idx) {
      if (this.editChoicesMode) return;

      this.socket.emit("makeChoice", { choice: idx }, (response) => {
        if (response.status) {
          this.roomState.players[this.playerId].choice = response.choice;
          this.roomState.players[this.playerId].originalChoice =
            response.originalChoice;
        }
      });
    },

    setName(playerName) {
      this.socket.emit("changeName", playerName, (response) => {
        if (response.status) {
          this.playerName = response.newName;
          this.roomState.players[this.playerId].name = this.playerName;

          localStorage.setItem("name", response.newName);
          localStorage.setItem("hasSetName", true);
          this.nameSetted = true;
        }
      });
    },

    changeRole(roleIndex) {
      let roleString = this.availableRoles[roleIndex];
      this.socket.emit(
        "changeRole",
        { role: roleString, id: this.playerId },
        (response) => {
          if (!response.status) {
            console.log(response.message);
            return;
          }

          localStorage.setItem("pokerRole", roleIndex);
        }
      );
    },

    revealClicked() {
      if (this.editChoicesMode) return;

      this.socket.emit("reveal", null, (response) => {
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
    },

    resetClicked() {
      this.socket.emit("reset", null, (response) => {
        if (response.status) {
          this.voteCount++;
          this.resetState();
        }
      });
    },

    toggleChoiceEditing() {
      if (this.roomState.revealed) return;

      this.editChoicesMode = !this.editChoicesMode;

      if (!this.editChoicesMode) {
        this.socket.emit("newChoices", this.roomState.choices, (response) => {
          if (response.status) {
            this.roomState.choices = response.choices;
          }
        });
      }
    },

    roomCodeClicked() {
      if (this.showCopySuccess) return;

      let currentLocation =
        location.protocol + "//" + location.host + location.pathname;
      let params = `?room=${this.roomId}`;
      navigator.clipboard.writeText(currentLocation + params);

      this.showCopySuccess = true;

      setTimeout(() => {
        this.showCopySuccess = false;
      }, 3000);
    },

    vibeClicked(index) {
      this.socket.emit("vibe", index, (response) => {
        if (response.status) {
          this.roomState.players[this.playerId].confidence = response.newVibe;
        }
      });
    },

    addChoice() {
      this.roomState.choices.push("?");
    },

    removeChoice(index) {
      this.roomState.choices.splice(index, 1);
    },

    editChoice(index, val) {
      this.roomState.choices[index] = val;
    },

    moveChoice(index, direction) {
      if (
        index + direction < 0 ||
        index + direction >= this.roomState.choices.length
      )
        return;
      let temp = this.roomState.choices[index];
      this.roomState.choices[index] = this.roomState.choices[index + direction];
      this.roomState.choices[index + direction] = temp;
    },

    getPlayersWithRole(role) {
      return Object.values(this.roomState.players).filter(
        (player) => player.role == role
      );
    },

    roleExists(role) {
      return this.getPlayersWithRole(role).length > 0;
    },

    getPlayer(id) {
      let plr = this.roomState?.players[id];
      return plr ? plr : { name: "no one", comeBack: false };
    },

    toggleObserver(id) {
      let role =
        this.roomState.players[id].role == "observer" ? "voter" : "observer";
      this.socket.emit("changeRole", { role: role, id: id }, (response) => {
        if (!response.status) {
          console.log(response.message);
        }
      });
    },

    // lil function to get the DISPLAYED index of a player
    // used for animations :)
    getPlayerDisplayIndex(player) {
      let playerCount = 0;
      for(let i = 0; i < this.existingRoles.length; i++) {
        for(let p of this.getPlayersWithRole(this.existingRoles[i])) {
          if(p.id == player.id) {
            return playerCount;
          }
          playerCount++;
        }
      }
      return 0;
    }
  },
  computed: {
    nameEdited() {
      return this.playerName != this.roomState.players[this.playerId].name;
    },

    hasSetName() {
      return localStorage.getItem("hasSetName") || this.nameSetted;
    },

    isRoomHost() {
      return this.playerId == this.roomState.host;
    },

    myPlayer() {
      return this.getPlayer(this.playerId);
    },

    existingRoles() {
      let result = [];

      for (let player of Object.values(this.roomState?.players)) {
        if (player.role && !result.includes(player.role)) {
          result.push(player.role);
        }
      }

      // sort alphabetically
      result.sort();

      // make sure observer is last
      if (result.includes("observer")) {
        result.splice(result.indexOf("observer"), 1);
        result.push("observer");
      }

      return result;
    },

    isConsensus() {
      if (!this.roomState?.revealed) return false;

      let choice = this.consensusValue;
      console.log('consensus', choice);
      for (let player of Object.values(this.roomState?.players)) {
        if (player.role != 'observer' && player.choice != choice) {
          return false;
        }
      }

      return true;
    },

    isMegaConsensus() {
      if (!this.roomState?.revealed) return false;

      let choice = this.consensusValue;
      console.log('mega', choice);
      for (let player of Object.values(this.roomState?.players)) {
        if(player.role == 'observer') continue;
        let hasOriginalChoice = player.originalChoice != null;
        if (
          player.choice != choice ||
          (hasOriginalChoice && player.originalChoice != choice)
        ) {
          return false;
        }
      }

      return true;
    },

    consensusValue() {
      if(this.roomState == null) return -1;
      for (let player of Object.values(this.roomState?.players)) {
        if (player.role != 'observer') {
          return player.choice;
        }
      }
    },
  },
};
</script>
