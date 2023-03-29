<template>
        <h2 class="text-3xl">🎗️ the standup awards 🎗️</h2>
        <div class="flex flex-wrap gap-4 justify-center mt-4">
            <div v-for="(stat, index) in emojiStats" :key="index"
                class="bg-gray-300 dark:bg-slate-500 dark:shadow-white rounded-xl p-4 pt-2 hover:scale-110 hover:shadow-lg hover:-translate-y-4 cursor-default transition-all">
                <p class="text-4xl">{{ getPlayerFn(stat.who).name }}</p>
                <p class="text-lg -mt-2">{{ stat.title }}</p>
                <p class="opacity-80 mt-1">{{ stat.desc }}</p>
            </div>
        </div>
</template>

<script>
export default {
    props: ['emojiStats', 'getPlayerFn']
}
</script>