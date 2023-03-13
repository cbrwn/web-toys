<template>
	<div class="text-4xl">
		<div>
			<span class="text-green-400">{{ correct }}</span> : <span class="text-red-400">{{ incorrect }}</span>
		</div>
		<div v-if="unanswered" class="text-lg">
			{{ unanswered }} unanswered
		</div>
	</div>
</template>

<script>
export default {
	props: ['correct', 'incorrect', 'unanswered']
}
</script>