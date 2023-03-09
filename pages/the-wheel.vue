<template>
  <div class="container mx-auto flex justify-center">
    <div class="flex flex-col w-full justify-center py-8 gap-y-3">
      <Header title="the wheel!">
      </Header>
      <ContentContainer>
        <div class="transition-all duration-300 select-none" @transitionend="resultSubtextFinished"
          style="margin-top: -20px; margin-bottom: 20px;" :style="`transform: scale(${this.resultState >= 1 ? '1.0' : '0.0'})`">
          the wheel has chosen...
          <p class="text-4xl transition-all duration-500" :style="`transform: scale(${this.resultState >= 2 ? '1.0' : '0.0'})`" @click="hideResult">
            <span class="animate-spin inline-block">🌟</span>
            {{ resultToShow }}!!
            <span class="animate-spin inline-block">🌟</span>
          </p>
        </div>
        <WheelSpinner :items="items" @spin-start="onSpinStart" @spin-end="onSpinFinish" style="margin-bottom: 40px"/>
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
    if (process.client) {
      if (localStorage.wheelItems)
        initItems = JSON.parse(localStorage.wheelItems);
    }
    return {
      items: initItems,
      resultState: 0,
      resultToShow: null
    };
  },
  methods: {
    hideResult() {
      this.resultState = 0;
    },
    onSpinStart() {
      this.hideResult();
    },
    onSpinFinish(selectedItem) {
      this.resultState = 1;
      this.resultToShow = selectedItem.item;
    },
    resultSubtextFinished() {
      if (this.resultState < 1) return;

      setTimeout(() => this.resultState++, 300);
    }
  }
}
</script>