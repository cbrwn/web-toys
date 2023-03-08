<template>
    <NuxtLink :to="item.url" class="bg-slate-300 w-60 rounded-2xl border-2 border-slate-400 aspect-video flex justify-center items-center font-semibold text-xl hover:shadow-2xl shadow-black transition-all duration-300 hover:scale-102 hover:bg-slate-200 min-w-fit p-10">
            {{ item.name }}
    </NuxtLink>
</template>

<script>
export default {
    props: ['item']
}
</script>