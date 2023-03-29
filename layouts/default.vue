<template>
  <div class="flex flex-col h-screen">
    <div
      class="flex items-center w-screen bg-gray-300 dark:bg-slate-700 py-3 px-6 shadow-lg"
    >
      <NuxtLink class="text-4xl" to="/">⬅</NuxtLink>
      <span class="text-2xl ml-2 text-gray-500 dark:text-gray-400"
        >cams internet toys</span
      >
    </div>
    <slot />
  </div>
</template>
