<template>
	<div class="flex flex-col items-center" :class="{ ['opacity-30']: player.choice < 0 }">
		<div class="flex items-center justify-center bg-slate-500 rounded-lg w-16 h-20 text-4xl font-bold">
			<span v-if="revealed && player.choice >= 0">
				<p v-if="player.originalChoice != null" class="-mb-3">
					{{ choices[player.choice] }}
				</p>
				<p :class="{['opacity-50 text-xl line-through']: player.originalChoice != null}">
					{{ player.originalChoice != null ? choices[player.originalChoice] : choices[player.choice] }}
				</p>
			</span>
			<span v-else-if="revealed">
				😴
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