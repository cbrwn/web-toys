<template>
	<div class="flex flex-row min-w-full bg-slate-200 hover:bg-slate-300 p-2 rounded-lg">
		<div class="flex items-center justify-center flex-grow">
			<slot />
		</div>
		<div class="select-none text-2xl">
			<span @click="moveClicked" class="cursor-pointer">{{ moveIcon }}️</span>
		</div>
	</div>
</template>

<script>
export default {
	props: ['onMove', 'moveIcon'],
	methods: {
		moveClicked() {
			this.$emit("onMove");
		}
	}
}
</script>