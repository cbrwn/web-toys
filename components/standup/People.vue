<template>
    <div class="bg-black/5 p-3">
        <div class="flex flex-row items-center">
            <h2 class="text-2xl font-bold">friends</h2>
            <p class="h-min ml-2">({{ people.length }})</p>
        </div>
        <div class="flex flex-col items-end">
            <span v-for="(person, index) in people" :key="index">
                <span v-if="person.id == hostid">👑</span>
                {{ person.name }}
                <span v-if="person.owner == myId" class="cursor-pointer" v-on:click="() => removePerson(person.id)">❌</span>
            </span>
        </div>
    </div>
</template>

<script>
export default {
    props: ['people', 'hostid', 'myId', 'removePerson']
}
</script>