<template>
	<div class="flex flex-col w-full max-w-4xl items-center gap-2">
		<h2 class="text-2xl"><slot /></h2>
		<div class="flex flex-col w-full items-center gap-4">
			<FolioProject v-for="(item, index) in projects" :key="index" :project="item" />
		</div>
	</div>
</template>

<script>
export default {
	props: ['projects']
}
</script>