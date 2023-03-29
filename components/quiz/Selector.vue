<template>
  <div
    class="flex flex-col justify-center items-center w-48 h-16 text-xl rounded-lg transition-all"
    :class="{
      ['cursor-pointer bg-gray-400 dark:bg-slate-600 hover:scale-102']:
        !selected,
      ['bg-gray-300 dark:bg-slate-500 drop-shadow-xl scale-110 cursor-default']:
        selected,
    }"
  >
    <slot />
  </div>
</template>

<script>
export default {
  props: ["selected"],
};
</script>
