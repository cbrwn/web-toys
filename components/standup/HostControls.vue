<template>
  <div class="flex flex-col mt-5">
    <p class="opacity-50">special host controls</p>
    <div class="flex flex-row justify-center gap-2">
      <button
        class="bg-blue-500 text-white p-2 rounded-xl"
        v-if="state == 'running'"
        v-on:click="skipFn"
      >
        skip {{ playerName }}
      </button>
      <div>
        <input
          type="text"
          class="px-2 h-full rounded-l-xl outline-none text-black"
          size="12"
          placeholder="new person"
          v-model="addPersonName"
        />
        <button
          class="bg-blue-500 text-white p-2 rounded-r-xl"
          v-on:click="
            () => {
              addFn(addPersonName);
              addPersonName = '';
            }
          "
        >
          add
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["skipFn", "playerName", "addFn", "state"],
  data() {
    return {
      addPersonName: "",
    };
  },
};
</script>
