<template>
  <div class="container mx-auto flex justify-center">
    <div class="flex flex-col w-full justify-center py-8 gap-y-3">
      <Header title="the wheel!">
      </Header>
      <ContentContainer>
        <div class="flex flex-col md:flex-row gap-8">
          <div class="">
            <div class="transition-all duration-300 select-none" @transitionend="resultSubtextFinished"
              style="margin-top: -20px; margin-bottom: 20px;"
              :style="`transform: scale(${this.resultState >= 1 ? '1.0' : '0.0'})`">
              the wheel has chosen...
              <p class="text-4xl transition-all duration-500"
                :style="`transform: scale(${this.resultState >= 2 ? '1.0' : '0.01'})`" @click="hideResult">
                <span class="animate-spin inline-block">🌟</span>
                {{ resultToShow }}!!
                <span class="animate-spin inline-block">🌟</span>
              </p>
            </div>
            <WheelSpinner :items="items" @spin-start="onSpinStart" @spin-end="onSpinFinish" style="margin-bottom: 40px" />
          </div>
          <WheelItemEditor :items="items" :bench="benchItems" @items-changed="onItemsChanged" :enabled="allowEditing" />
        </div>
      </ContentContainer>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'default',
  created() { document.title = 'the wheel.'; },
  data() {
    let initItems = ['cam', 'matt', 'darcy 1', 'darcy 2',
      'jeff',
      'bob',
      'jason',
      'aaron',
      'ben',
      'greg',
      'henry',
      'jake',
      'larry',
      'tom',
      'fred',
    ];
    let initBench = [];
    if (process.client) {
      if (localStorage.wheelItems)
        initItems = JSON.parse(localStorage.wheelItems);
      if (localStorage.benchItems)
        initBench = JSON.parse(localStorage.benchItems);
    }

    return {
      items: initItems,
      benchItems: initBench,
      resultState: 0,
      resultToShow: null,
      allowEditing: true
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

      localStorage.wheelItems = JSON.stringify(this.items);
      localStorage.benchItems = JSON.stringify(this.benchItems);
    }
  }
}
</script>