<template>
	<div class="flex flex-row min-w-full transition-colors bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 p-2 rounded-lg">
		<div class="flex items-center justify-center flex-grow">
			<span v-if="!editMode" v-on:dblclick="editClicked">{{ itemName }}</span>
			<input v-if="editMode" ref="editBox" class="dark:bg-slate-300 dark:text-black" :value="itemName" v-on:keypress="onEditPress" size="10">
		</div>
		<div class="select-none text-2xl flex gap-2">
			<span @click="deleteClicked" class="cursor-pointer" v-if="showDelete">❌</span>
			<span @click="editClicked" class="cursor-pointer" v-if="!editMode">️✍️</span>
			<span @click="editClicked" class="cursor-pointer" v-if="editMode">️✅</span>
			<span @click="moveClicked" class="cursor-pointer">{{ moveIcon }}️</span>
		</div>
	</div>
</template>

<script>
export default {
	props: ['onMove', 'itemName', 'moveIcon', 'showDelete', 'enabled'],
	data() {
		return {
			editMode: false
		};
	},
	watch: {
		itemName: function () {
			if (this.itemName == 'new item' && !this.editMode) {
				this.editClicked();
			}
		}
	},
	methods: {
		moveClicked() {
			if (this.enabled)
				this.$emit("onMove");
		},
		deleteClicked() {
			if (this.enabled)
				this.$emit("onDelete");
		},
		editClicked() {
			if (!this.enabled) return;

			if (this.editMode) {
				this.$emit("itemEdited", this.$refs.editBox.value);
			}

			this.editMode = !this.editMode;

			if (this.editMode) {
				setTimeout(() => this.$refs.editBox.focus(), 1);
			}
		},
		onEditPress(event) {
			if (this.editMode && event.key == 'Enter') this.editClicked();
		}
	}
}
</script>