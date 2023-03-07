<template>
  <div class="container mx-auto flex justify-center">
    <div class="flex flex-col w-full justify-center py-8 gap-y-3">
      <Header>
        Life Checklist
      </Header>
      <div class="grid grid-cols-3 gap-2">
        <CheckItem v-for="(item, index) in lifeItems" :key="index" :item="item" :index="index" :clickedIndex="itemClicked"
          :items="checkedItems" />
      </div>
      <ProgressFooter :completed="checkedCount" :total="itemCount" />
    </div>
  </div>
</template>

<style>
body {
  background-color: rgb(218, 221, 230);
}
</style>

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
      lifeItems: ["Do thing 1", "Do another thing", "Do some more things", "absabbasb", "aslkdas", "poop ur pants", "fart haha", "big poopys", "complete checklist!"],
      checkedItems: initItems
    }
  },
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