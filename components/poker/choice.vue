<template>
	<div class="flex flex-col items-center">
		<div class="flex items-center justify-center rounded-lg w-16 h-20 text-4xl font-bold transition-all cursor-pointer select-none" 
			:class="{['bg-green-500 scale-110']: selected, ['bg-slate-500 hover:scale-105']: !selected}">
			<slot />
		</div>
	</div>
</template>

<script>
export default {
	props: ['selected']
}
</script>