<template>
  <NuxtLink
    :to="item.url"
    class="flex flex-col bg-slate-300 dark:bg-slate-700 w-60 rounded-2xl border-2 border-slate-400 dark:border-slate-500 aspect-video justify-center items-center hover:shadow-2xl shadow-black transition-all duration-300 hover:scale-102 hover:bg-slate-200 dark:hover:bg-slate-600 min-w-fit p-10"
  >
    <p class="font-semibold text-xl">
      {{ item.name }}
    </p>
    <p v-if="item.desc" class="opacity-30">
      {{ item.desc }}
    </p>
  </NuxtLink>
</template>

<script>
export default {
  props: ["item"],
};
</script>
