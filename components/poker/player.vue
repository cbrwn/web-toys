<template>
  <div>

    <div class="flex flex-col items-center transition-opacity select-none" :class="{ ['opacity-30']: player.choice < 0 }">
      <div class="flex items-center justify-center rounded-lg w-16 h-20 text-4xl text-black font-bold relative" :class="{
        ['bg-gray-300 dark:bg-slate-500']: !revealed,
        [ roleBg ]: revealed
      }">
        <span v-if="observer">
          👀
        </span>
        <span v-else-if="revealed && player.choice >= 0">
          <p class="transition-all duration-300" :class="{ ['translate-y-2']: player.originalChoice != null }">
            {{ choices[player.choice] }}
          </p>
          <p v-if="player.originalChoice != null" class="opacity-50 text-xl line-through">
            {{ choices[player.originalChoice] }}
          </p>
          <div class="absolute -top-2 -right-2 text-2xl" v-if="player.confidence != null">
            {{ vibes[player.confidence].icon }}
          </div>
        </span>
        <span v-else-if="revealed"> 😴 </span>
        <span v-else> ❓ </span>
      </div>
      {{ player.name }}
    </div>
    <div v-if="host" class="relative">
      <button class="text-2xl" v-on:click="observeFn(player.id)" v-on:mouseenter="() => observeHovered = true"
        v-on:mouseleave="() => observeHovered = false">
        {{ observer ? "🤔" : '👀' }}
      </button>
      <p class="transition-all -mt-2 select-none pointer-events-none absolute whitespace-nowrap"
        :class="{ 'scale-100 -rotate-2': observeHovered, 'scale-0 -translate-y-2 rotate-12': !observeHovered, '-translate-x-4': !observer, '-translate-x-1': observer }">
        {{ observer ? "make voter" : 'make observer' }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: ["player", "choices", "revealed", "vibes", "observer", "host", "observeFn", "roleBg"],
  data() {
    return {
      observeHovered: false
    }
  }
};
</script>
