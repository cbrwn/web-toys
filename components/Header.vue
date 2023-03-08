<!--
	A header for use in life checklist
	Takes a title which it makes big, and leaves a slot for a subtitle or two
-->

<template>
	<div class="flex-1 w-full text-center bg-slate-100 p-8 rounded-lg">
		<h1 class="text-4xl font-bold">
			{{ title }}
		</h1>
		<div class="text-gray-400">
			<slot />
		</div>
	</div>
</template>

<script>
export default {
	props: ['title']
}
</script>