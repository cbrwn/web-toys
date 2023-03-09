<template>
	<div class="w-96">
		<h1 class="text-4xl">items</h1>
		<div class="flex flex-row gap-2 h-96 overflow-auto">
			<div class="flex flex-col flex-grow items-center justify-start w-1/2 gap-2">
				<h2 class="text-2xl">active</h2>
				<WheelItem v-for="(item, index) in items" @on-move="moveToBench(item)" :moveIcon="bench.length > 0 ? (items.length>1 ? '➡️' : '') : '🫥'">
					{{ item }}
				</WheelItem>
			</div>
			<div class="flex flex-col flex-grow items-center justify-start w-1/2 gap-2" v-if="bench.length>0">
				<h2 class="text-2xl">bench</h2>
				<WheelItem v-for="(item, index) in bench" @on-move="moveToActive(item)" moveIcon="⬅️">
					{{ item }}
				</WheelItem>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: ['items', 'bench'],
	methods: {
		moveToBench(item) {
			let newItems = this.items.filter((i) => i != item);
			let newBench = this.bench.concat([item]);
			this.$emit("itemsChanged", { items: newItems, bench: newBench });
		},
		moveToActive(item) {
			let newItems = this.items.concat([item]);
			let newBench = this.bench.filter((i) => i != item);
			this.$emit("itemsChanged", { items: newItems, bench: newBench });
		}
	}
}
</script>