<template>
  <div class="flex flex-col items-center w-28">
    <div
      class="flex items-center justify-center rounded-full aspect-square w-20 text-2xl transition-all text-white hover:scale-110 cursor-default"
      :class="color"
    >
      {{ score }}
    </div>
    {{ type }}
  </div>
</template>

<script>
export default {
  props: ["score", "type", "color"],
};
</script>
