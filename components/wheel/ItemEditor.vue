<template>
  <div class="w-96">
    <div class="flex justify-center items-center">
      <h1 class="text-4xl flex-grow">items</h1>
      <span class="flex-shrink text-2xl select-none">
        <span v-if="showCopySuccess"> ✅ </span>
        <span class="cursor-pointer" v-on:click="copyItemsClicked" v-else
          >📋</span
        >
        <span
          class="text-lg absolute transition-transform"
          :style="`transform: translate(-75%, ${
            this.showCopySuccess ? '-100%' : '0%'
          }) scale(${this.showCopySuccess ? '1.0' : '0.0'});`"
        >
          copied url!
        </span>
      </span>
    </div>
    <div class="flex flex-row gap-2 h-96">
      <div
        class="flex flex-col flex-grow items-center justify-start w-1/2 gap-2"
      >
        <h2 class="text-2xl">
          active <span class="cursor-pointer" v-on:click="addClicked">➕</span>
        </h2>
        <div class="overflow-auto w-full flex flex-col gap-2">
          <WheelItem
            v-for="(item, index) in items"
            @on-move="moveToBench(item)"
            @item-edited="(i) => onItemEdited(index, i)"
            :itemName="item"
            :moveIcon="bench.length > 0 ? (items.length > 1 ? '➡️' : '') : '🫥'"
            :enabled="enabled"
          />
        </div>
      </div>
      <div
        class="flex flex-col flex-grow items-center justify-start w-1/2 gap-2"
        v-if="bench.length > 0"
      >
        <h2 class="text-2xl">bench</h2>
        <div class="overflow-auto w-full flex flex-col gap-2">
          <WheelItem
            v-for="(item, index) in bench"
            @on-move="moveToActive(item)"
            @item-edited="(i) => onBenchEdited(index, i)"
            @on-delete="deleteFromBench(index)"
            :itemName="item"
            moveIcon="⬅️"
            showDelete="true"
            :enabled="enabled"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["items", "bench", "enabled"],
  data() {
    return {
      showCopySuccess: false,
    };
  },
  methods: {
    moveToBench(item) {
      if (!this.enabled) return;
      let newItems = this.items.filter((i) => i != item);
      let newBench = this.bench.concat([item]);
      this.$emit("itemsChanged", { items: newItems, bench: newBench });
    },
    moveToActive(item) {
      if (!this.enabled) return;
      let newItems = this.items.concat([item]);
      let newBench = this.bench.filter((i) => i != item);
      this.$emit("itemsChanged", { items: newItems, bench: newBench });
    },

    addClicked() {
      if (!this.enabled) return;
      let newItems = ["new item"].concat(this.items);
      this.$emit("itemsChanged", { items: newItems, bench: this.bench });
    },

    onItemEdited(index, newValue) {
      if (!this.enabled) return;
      let newItems = [...this.items];
      newItems[index] = newValue;
      this.$emit("itemsChanged", { items: newItems, bench: this.bench });
    },
    onBenchEdited(index, newValue) {
      if (!this.enabled) return;
      let newBench = [...this.bench];
      newBench[index] = newValue;
      this.$emit("itemsChanged", { items: this.items, bench: newBench });
    },
    deleteFromBench(index) {
      if (!this.enabled) return;
      let newBench = [...this.bench];
      newBench.splice(index, 1);
      this.$emit("itemsChanged", { items: this.items, bench: newBench });
    },

    copyItemsClicked() {
      let currentLocation =
        location.protocol + "//" + location.host + location.pathname;
      let params = `?items=${this.$itemsToB64(this.items, this.bench)}`;
      navigator.clipboard.writeText(currentLocation + params);

      this.showCopySuccess = true;
      setTimeout(() => (this.showCopySuccess = false), 3000);
    },
  },
};
</script>
