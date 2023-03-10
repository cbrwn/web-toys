<!--
	A whole "checkable item" component,
	Container which contains the checkbox itself and the item name
-->

<template>
	<div class="flex font-semibold items-center gap-4 h-24 p-10 rounded-md cursor-pointer transition-colors duration-200 min-w-fit" :class="{['text-white hover:bg-green-600 bg-green-500']: isChecked, ['bg-slate-100 hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600']: !isChecked}" v-on:click="clickedIndex(index)">
		<CheckBox :checked="isChecked" />
		{{ item }}
	</div>
</template>

<script>
export default {
	props: ['index', 'item', 'items', 'clickedIndex'],
	computed: {
		isChecked: {
			get() {
				return this.items.includes(this.index);
			}
		}
	}
}
</script>