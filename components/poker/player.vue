<template>
  <div>

    <div class="card-container h-20 w-16">
      <div class="flex flex-col card items-center transition-opacity select-none"
        :class="{ 'card-revealed': revealed && !observer }"
        :style="transitionDelayStyle">

        <div class="flex items-center card-face card-face--front justify-center rounded-lg text-4xl text-black font-bold relative bg-gray-300 dark:bg-slate-500"
        :class="{ 'opacity-30': player.choice < 0}">
          <span v-if="observer">
            👀
          </span>
          <span v-else> ❓ </span>
        </div>

        <div class="card-face card-face--back rounded-lg text-4xl text-black font-bold" 
        :class="cardFrontClass">
          <span v-if="player.choice >= 0">
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
          <span v-else> 😴 </span>
        </div>
      </div>
    </div>
    {{ player.name }}
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
  props: ["player", "choices", "revealed", "vibes", "observer", "host", "observeFn", "roleBg", "idx"],
  data() {
    return {
      observeHovered: false
    }
  },
  computed: {
    // some hackery to have a conditional class & a computed one
    cardFrontClass() {
      let cls = [this.roleBg];

      if(this.player.choice < 0)
        cls.push('opacity-30');

      return cls;
    },

    transitionDelayStyle() {
      return `transition-delay: ${this.idx * 50}ms`;
    }
  }
};
</script>

<style scoped>
.card-container {
  perspective: 1000px;
  margin: 0 auto;
}

.card {
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s;
  position: relative;
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-face--back {
  transform: rotateY(180deg);
}

.card-container:hover .card {
  transform: rotateY(180deg);
}

.card-revealed {
  transform: rotateY(180deg);
}
</style>