<template>
  <div class="flex flex-wrap gap-2 w-full justify-center">
    <StandupEmojiItem v-for="(emojiIndex, index) in mostUsedEmojis" :key="index"
      v-on:click="() => emojiClicked(emojiIndex)">
      {{ emojis[emojiIndex] }}
    </StandupEmojiItem>
  </div>
  <button class="opacity-50 mt-3 transition-transform hover:-translate-y-0.5 cursor-pointer" v-on:click="() => viewAll = !viewAll">{{ viewAll ? '&#9660; hide emojis &#9660;' : '&#9650; show all emojis &#9650;'
  }}</button>
  <div class="flex flex-wrap w-full gap-2 justify-center overflow-clip transition-all duration-1000 pt-5"
    :class="{ 'max-h-0': !viewAll, 'max-h-48': viewAll }">
    <StandupEmojiItem :class="{'pointer-events-none': !viewAll}" v-for="(emoji, index) in emojis" :key="index" v-on:click="() => emojiClicked(index)">
      {{ emoji }}
    </StandupEmojiItem>
  </div>
</template>

<script>
export default {
  props: ['onClicked', 'emojis', 'clickEnabled'],
  data() {
    let emojiHistory = localStorage.getItem("standupEmojiHistory");
    if (!emojiHistory) {
      emojiHistory = {};
    } else {
      emojiHistory = JSON.parse(emojiHistory);
    }

    for (let i = 0; i < this.emojis.length; i++) {
      if (emojiHistory[this.emojis[i]] == null)
        emojiHistory[this.emojis[i]] = 0;
    }
    return {
      emojiHistory: emojiHistory,
      viewAll: false
    }
  },

  methods: {
    emojiClicked(index) {
      if(!this.clickEnabled) return;

      this.onClicked(index);

      let thisEmoji = this.emojis[index];
      if (this.emojiHistory[thisEmoji] == null)
        this.emojiHistory[thisEmoji] = 0;

      this.emojiHistory[thisEmoji]++;
      console.log(this.emojiHistory);
      localStorage.setItem("standupEmojiHistory", JSON.stringify(this.emojiHistory));
    }
  },

  computed: {
    mostUsedEmojis() {
      const emojiCount = 10;

      let sorted = [...this.emojis].sort((a, b) => {
        return this.emojiHistory[b] - this.emojiHistory[a];
      });

      let indices = [];
      for (let i = 0; i < emojiCount; i++) {
        indices.push(this.emojis.indexOf(sorted[i]));
      }

      indices.sort((a, b) => {
        return a - b;
      });

      return indices;
    }
  }
}
</script>