<template>
	<div class="flex flex-col gap-12 w-screen h-screen justify-center items-center">
		<h1 class="text-2xl">camerons internet toys</h1>
		<div class="flex flex-wrap justify-center items-center gap-8">
			<HomeLink v-for="(item, index) in pages" :key="index" :item="item" />
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			pages: [
				{
					name: 'life checklist',
					url: '/life-checklist'
				},
				{
					name: 'the wheel',
					url: '/the-wheel'
				},
				{
					name: 'quizzifier',
					url: '/quizzifier'
				},
			]
		};
	},
	created() { document.title='cams internet toys'; }
}

definePageMeta({
	layout: 'empty'
});
</script>