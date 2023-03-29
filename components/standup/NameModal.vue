<!--
    NameModal

    draws a centered popup with a darkened background for the user to enter their name
    has a cute "hello, my name is" style to it :)
-->

<template>
  <div
    class="flex justify-center items-center fixed left-0 top-0 w-full h-full bg-black/50 z-50"
  >
    <div
      class="flex flex-col bg-slate-300 dark:bg-slate-600 w-1/3 h-min rounded-3xl pt-5"
    >
      <slot />

      <div class="flex-grow flex flex-col justify-center items-center pb-5">
        <p class="mb-2">please set your name!</p>

        <div
          class="rounded-xl overflow-clip border-solid border-black border-2"
        >
          <div class="bg-red-600 w-full text-white">
            <p class="text-2xl -mb-3">hello</p>
            <p>my name is</p>
          </div>
          <input
            type="text"
            class="text-black text-center py-3 text-xl outline-none w-full"
            v-model="tempName"
            v-on:keypress="
              (event) => {
                if (event.key == 'Enter') setNameFn(tempName);
              }
            "
          />
          <div class="bg-red-600 w-full h-4"></div>
        </div>
        <button
          class="bg-green-500 rounded-lg mt-3 py-2 px-4 disabled:opacity-50 transition-all"
          v-on:click="() => setNameFn(tempName)"
          :disabled="tempName == 'standupper'"
        >
          set name
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["setNameFn"],
  data() {
    return {
      tempName: "standupper",
    };
  },
};
</script>
