<template>
  <div
    class="flex flex-col text-4xl transition-all select-none cursor-pointer"
    :class="{
      ['scale-125 -rotate-12 cursor-default hover:rotate-12 hover:scale-110']:
        selected,
      ['hover:scale-110 hover:rotate-12 hover:-translate-y-2']: !selected,
    }"
    v-on:mouseover="onMouseOver"
    v-on:mouseout="onMouseOut"
  >
    <slot />
    <div
      class="transition-all text-sm"
      :class="{
        ['scale-100 -rotate-6 -translate-y-2']: mouseOver && !selected,
        ['scale-0']: !mouseOver && !selected,
        ['rotate-12 -translate-y-1 -translate-x-1']: selected,
      }"
    >
      {{ desc }}
    </div>
  </div>
</template>

<script>
export default {
  props: ["selected", "desc"],
  data() {
    return {
      mouseOver: false,
    };
  },
  methods: {
    onMouseOver() {
      this.mouseOver = true;
    },
    onMouseOut() {
      this.mouseOver = false;
    },
  },
};
</script>
