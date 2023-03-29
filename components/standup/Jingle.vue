<template>
  <div
    class="h-full flex items-center text-4xl"
    :class="{ ['animate-jingle']: i == 0, ['animate-jingle2']: i == 1 }"
  >
    🔔
  </div>
</template>

<script>
export default {
  props: ["i"],
};
</script>

<style scoped>
.animate-jingle {
  animation: jingle 2s ease 0s infinite normal forwards;
}

.animate-jingle2 {
  animation: jingle-reverse 2s ease 0s infinite normal forwards;
}

@keyframes jingle {
  0%,
  50% {
    transform: translateX(0%);
    transform-origin: 50% 50%;
  }

  7.5% {
    transform: translateX(-7) rotate(12deg);
  }

  15% {
    transform: translateX(3px) rotate(-12deg);
  }

  22.5% {
    transform: translateX(-3px) rotate(7.2deg);
  }

  30% {
    transform: translateX(2px) rotate(-4.8deg);
  }

  37.5% {
    transform: translateX(-1px) rotate(2.4deg);
  }
}

@keyframes jingle-reverse {
  0%,
  50% {
    transform: translateX(0%);
    transform-origin: 50% 50%;
  }

  7.5% {
    transform: translateX(7) rotate(-12deg);
  }

  15% {
    transform: translateX(-3px) rotate(12deg);
  }

  22.5% {
    transform: translateX(3px) rotate(-7.2deg);
  }

  30% {
    transform: translateX(-2px) rotate(4.8deg);
  }

  37.5% {
    transform: translateX(1px) rotate(-2.4deg);
  }
}
</style>
