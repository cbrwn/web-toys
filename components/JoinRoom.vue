<template>
  <div class="flex justify-center items-center">
    <div class="flex flex-row w-full justify-center">
      <div class="flex flex-col items-center">
        <div class="w-min flex flex-col">
          <slot />
          <input
            type="text"
            class="text-black text-2xl p-2 text-center rounded-t-lg outline-none"
            placeholder="room name"
            :value="roomId"
            @input="$emit('update:roomId', $event.target.value)"
            @keypress="if ($event.key == 'Enter') onConfirm();"
          />
          <button
            class="bg-blue-500 text-lg rounded-b-lg py-2"
            v-on:click="onConfirm"
          >
            join room
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["roomId", "onConfirm"],
  emits: ["update:roomId"],
};
</script>
