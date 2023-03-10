<!--
	A header for use in life checklist
	Takes a title which it makes big, and leaves a slot for a subtitle or two
-->

<template>
	<ContentContainer>
		<h1 class="text-4xl font-bold">
			{{ title }}
		</h1>
		<div class="text-gray-400 dark:text-gray-300">
			<slot />
		</div>
	</ContentContainer>
</template>

<script>
export default {
	props: ['title']
}
</script>