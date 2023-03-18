<template>
	<div class="flex flex-col items-center transition-opacity" :class="{ ['opacity-30']: player.choice < 0 }">
		<div class="flex items-center justify-center rounded-lg w-16 h-20 text-4xl font-bold relative"
				:class="{['bg-slate-500']: !revealed, ['bg-blue-500']: revealed}">
			<span v-if="revealed && player.choice >= 0">
				<p class="transition-all duration-300" :class="{['translate-y-2']: player.originalChoice != null}">
					{{ choices[player.choice] }}
				</p>
				<p v-if="player.originalChoice != null" class="opacity-50 text-xl line-through">
					{{ choices[player.originalChoice] }}
				</p>
				<div class="absolute -top-2 -right-2 text-2xl" v-if="player.confidence != null">
					{{ vibes[player.confidence].icon }}
				</div>
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
	props: ['player', 'choices', 'revealed', 'vibes']
}
</script>