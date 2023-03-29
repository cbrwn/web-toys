<template>
  <div class="container mx-auto flex justify-center">
    <div class="flex flex-col w-full justify-center py-8 gap-y-3">
      <Header title="the wheel!"> </Header>
      <ContentContainer>
        <div class="flex flex-col md:flex-row gap-8">
          <div class="">
            <div
              class="transition-all duration-300 select-none"
              @transitionend="resultSubtextFinished"
              style="margin-top: -20px; margin-bottom: 20px"
              :style="`transform: scale(${
                this.resultState >= 1 ? '1.0' : '0.0'
              })`"
            >
              the wheel has chosen...
              <p
                class="text-4xl transition-all duration-500"
                :style="`transform: scale(${
                  this.resultState >= 2 ? '1.0' : '0.01'
                })`"
                @click="hideResult"
              >
                <span class="animate-spin inline-block">🌟</span>
                {{ resultToShow }}!!
                <span class="animate-spin inline-block">🌟</span>
              </p>
            </div>
            <WheelSpinner
              :items="items"
              @spin-start="onSpinStart"
              @spin-end="onSpinFinish"
              style="margin-bottom: 40px"
            />
          </div>
          <WheelItemEditor
            :items="items"
            :bench="benchItems"
            @items-changed="onItemsChanged"
            :enabled="allowEditing"
          />
        </div>
      </ContentContainer>
    </div>
  </div>
</template>

<script>
export default {
  layout: "default",
  created() {
    document.title = "the wheel.";
  },
  data() {
    let initItems = ["item 1", "item 2", "item 3", "item 4"];
    let initBench = [];
    if (process.client) {
      if (localStorage.wheelItems)
        initItems = JSON.parse(localStorage.wheelItems);
      if (localStorage.benchItems)
        initBench = JSON.parse(localStorage.benchItems);
    }

    if (this.$route.query.items) {
      let itemsString = this.$route.query.items;

      if (itemsString.includes(",")) {
        let decodedItems = this.$b64ToItems(itemsString);
        initItems = decodedItems.items;
        initBench = decodedItems.bench;

        this.saveItems(initItems, initBench);
      }

      // clear ugly item query
      window.history.replaceState(null, document.title, location.pathname);
    }

    return {
      items: initItems,
      benchItems: initBench,
      resultState: 0,
      resultToShow: null,
      allowEditing: true,
    };
  },
  methods: {
    hideResult() {
      this.resultState = -1000;
    },
    onSpinStart() {
      this.hideResult();
      this.allowEditing = false;
    },
    onSpinFinish(selectedItem) {
      this.resultState = 1;
      this.resultToShow = selectedItem.item;
      this.allowEditing = true;
    },
    resultSubtextFinished() {
      if (this.resultState < 1) return;

      setTimeout(() => this.resultState++, 300);
    },
    onItemsChanged(itemObj) {
      if (!this.allowEditing) return;

      this.items = itemObj.items;
      this.benchItems = itemObj.bench;

      this.saveItems(this.items, this.benchItems);
    },
    saveItems(w, b) {
      localStorage.wheelItems = JSON.stringify(w);
      localStorage.benchItems = JSON.stringify(b);
    },
  },
};
</script>
