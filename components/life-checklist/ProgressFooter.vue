<template>
  <ContentContainer>
    <p>you've completed {{ completed }}/{{ total }} items</p>
    <div class="w-10/12 h-8 bg-gray-200 dark:bg-gray-500 rounded-md">
      <div
        class="h-8 bg-green-500 rounded-md progressWidth transition-all duration-300 ease-out"
      ></div>
    </div>
  </ContentContainer>
</template>

<script>
export default {
  props: ["completed", "total"],
  computed: {
    percentage: {
      get() {
        return (this.completed / this.total) * 100 + "%";
      },
    },
  },
};
</script>

<style scoped>
.progressWidth {
  width: v-bind("percentage");
}
</style>
