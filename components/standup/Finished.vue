<template>
    <div class="flex flex-col h-full items-center justify-center">
        <h1 class="text-4xl">that's everyone!</h1>
        <p>thanks for using the standup-o-matic 5000</p>
        <p>have a great {{ dayOfWeekString }}!!</p>

        <div v-if="isHost" class="mt-5">
            <button class="bg-amber-500 p-4 rounded-lg" v-on:click="onResetClicked">reset room</button>
        </div>

        <StandupEmojiStats v-if="emojiStats != null" class="mt-4" :emojiStats="emojiStats" :getPlayerFn="getPlayerFn" />
    </div>
</template>

<script>
export default {
    props: ['onResetClicked', 'isHost', 'emojiStats', 'getPlayerFn'],
    computed: {
        dayOfWeekString() {
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            return dayNames[new Date().getDay()];
        }
    }
}
</script>