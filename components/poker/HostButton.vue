<template>
  <button
    class="w-1/3 px-4 py-1 text-black transition-all"
    :class="{
      ['opacity-50 cursor-default']: disable,
      ['hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer']:
        !disable,
    }"
  >
    <slot />
  </button>
</template>

<script>
export default {
  props: ["disable"],
};
</script>
