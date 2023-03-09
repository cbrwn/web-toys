<template>
	<div class="w-96">
		<h1 class="text-4xl">items</h1>
		<div class="flex flex-row gap-2 h-96 overflow-auto">
			<div class="flex flex-col flex-grow items-center justify-start w-1/2 gap-2">
				<h2 class="text-2xl">active <span class="cursor-pointer" v-on:click="addClicked">➕</span></h2>
				<WheelItem v-for="(item, index) in items" @on-move="moveToBench(item)"
					@item-edited="(i) => onItemEdited(index, i)" :itemName="item"
					:moveIcon="bench.length > 0 ? (items.length > 1 ? '➡️' : '') : '🫥'" />
			</div>
			<div class="flex flex-col flex-grow items-center justify-start w-1/2 gap-2" v-if="bench.length > 0">
				<h2 class="text-2xl">bench</h2>
				<WheelItem v-for="(item, index) in bench" @on-move="moveToActive(item)"
					@item-edited="(i) => onBenchEdited(index, i)" @on-delete="deleteFromBench(index)" :itemName="item"
					moveIcon="⬅️" showDelete="true" />
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
		},

		addClicked() {
			let newItems = ['new item'].concat(this.items);
			this.$emit("itemsChanged", { items: newItems, bench: this.bench });
		},

		onItemEdited(index, newValue) {
			let newItems = [...this.items];
			newItems[index] = newValue;
			this.$emit("itemsChanged", { items: newItems, bench: this.bench });
		},
		onBenchEdited(index, newValue) {
			let newBench = [...this.bench];
			newBench[index] = newValue;
			this.$emit("itemsChanged", { items: this.items, bench: newBench });
		},
		deleteFromBench(index) {
			let newBench = [...this.bench];
			newBench.splice(index, 1);
			this.$emit("itemsChanged", { items: this.items, bench: newBench });
		}
	}
}
</script>