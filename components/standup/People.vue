<template>
    <div class="bg-black/5 p-3">
        <div class="flex flex-row justify-center items-center">
            <h2 class="text-2xl font-bold">friends</h2>
            <p class="h-min ml-2">({{ people.length }})</p>
        </div>
        <div class="flex flex-col items-end pl-2">
            <div v-for="(person, index) in people" :key="index" class="flex flex-row">
                <div class="transition-all ease-bounce" :class="{['scale-150 -translate-x-2']: shouldShow(person.id), ['scale-0 rotate-90 translate-x-6']: !shouldShow(person.id) }">
                    {{ reacts.hasOwnProperty(person.id) ? reacts[person.id].emoji : ' ' }}
                </div>
                <div v-if="person.id == hostid">👑</div>
                {{ person.name }}
                <div v-if="person.owner == myId" class="cursor-pointer" v-on:click="() => removePerson(person.id)">❌</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.ease-bounce {
    transition-timing-function: cubic-bezier(.28,.53,.17,1.34);
}
</style>

<script>
export default {
    props: ['people', 'hostid', 'myId', 'removePerson'],
    data() {
        return {
            reacts: {}
        };
    },
    watch: {
        people() {
            for (let person of this.people) {
                if(!this.reacts.hasOwnProperty(person.id)) {
                    this.reacts[person.id] = { emoji: '', show: false };
                }
            }
        }
    },
    methods: {
        personReacted(id, emoji) {
            console.log(`react from ${id}`);
            this.reacts[id] = { emoji: emoji, show: true };

            setTimeout(() => {
                this.reacts[id].show = false;
            }, 950);
        },

        shouldShow(id) {
            if(!this.reacts.hasOwnProperty(id)) {
                return false;
            }
            return this.reacts[id].show;
        }
    }
}
</script>