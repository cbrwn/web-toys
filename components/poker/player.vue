<template>
	<div class="flex flex-col items-center" :class="{ ['opacity-30']: player.choice < 0 }">
		<div class="flex items-center justify-center bg-slate-500 rounded-lg w-16 h-20 text-4xl font-bold">
			<span v-if="revealed">
				{{ choices[player.choice] }}
			</span>
			<span v-else>
				❓
			</span>
		</div>
		{{ player.name }}
	</div>
</template>

<script>
export default {
	props: ['player', 'choices', 'revealed']
}
</script>