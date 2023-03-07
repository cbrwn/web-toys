<template>
  <div class="container mx-auto flex justify-center">
    <div class="flex flex-col w-full justify-center py-8 gap-y-3">
      <LifeChecklistHeader title="life checklist">
        <p> a shameless clone of <a href='https://twitter.com/nealagarwal' target="_blank">Neal Agarwal</a>'s <a
            href='https://neal.fun/life-checklist/' target="_blank">life checklist</a> </p>
        <p> made to learn my way around nuxt/vue :) </p>
      </LifeChecklistHeader>
      <div class="gap-2 grid grid-cols-2 md:grid-cols-3">
        <LifeChecklistCheckItem v-for="(item, index) in lifeItems" :key="index" :item="item" :index="index"
          :clickedIndex="itemClicked" :items="checkedItems" />
      </div>
      <LifeChecklistProgressFooter :completed="checkedCount" :total="itemCount" />
    </div>
  </div>
</template>

<script>
export default {
  layout: 'default',
  data() {
    let initItems = [];
    if (process.client) {
      if (localStorage.checkedItems)
        initItems = JSON.parse(localStorage.checkedItems);
    }

    return {
      lifeItems: ["do something cool", "make something cool", "do more things", "eat food", "wear a hat", "take a nap", "dance", "do a backflip", "complete checklist!"],
      checkedItems: initItems
    }
  },
  created() { document.title = 'life checklist'; },
  methods: {
    itemClicked: function (idx) {
      const lastIndex = this.lifeItems.length - 1;
      // don't allow checking the last item directly
      if (idx == lastIndex)
        return;

      if (this.checkedItems.includes(idx)) {
        // remove the clicked item & the final item if it exists
        this.checkedItems = this.checkedItems.filter(i => i != idx && i != lastIndex);
      } else {
        this.checkedItems.push(idx);

        // since we're adding an item, check if it was the last completable item & add the "complete all" one if so
        if (this.checkedCount == (this.itemCount - 1)) {
          this.checkedItems.push(lastIndex);
        }
      }

      localStorage.checkedItems = JSON.stringify(this.checkedItems);
    }
  },
  computed: {
    // total number of items, used to pass into progress component
    itemCount: {
      get() {
        return this.lifeItems.length;
      }
    },
    // number of completed items, used to pass into progress component
    checkedCount: {
      get() {
        return this.checkedItems.length;
      }
    },
  }
}
</script>

<style scoped>
a {
  text-decoration: underline;
}
</style>