<template>
	<div class="flex flex-col items-center">
		<div v-if="editMode" class="flex flex-col mt-1 w-full">
			<div class="flex flex-row">
				<PokerChoiceEdit class="bg-teal-600 rounded-tl-lg border-r-2 border-black" v-on:click="() => onMove(1)">
					👉
				</PokerChoiceEdit>
				<PokerChoiceEdit class="bg-teal-600 rounded-tr-lg" v-on:click="() => onMove(-1)">
					👈
				</PokerChoiceEdit>
			</div>
		</div>
		<div class="flex items-center justify-center w-16 h-20 text-4xl font-bold transition-all cursor-pointer select-none"
			:class="{ ['bg-green-500 scale-110']: selected && !editMode, ['bg-slate-500 hover:scale-105']: !selected || editMode, ['rounded-lg']: !editMode }"
			v-on:click="cardClicked">
			<span v-if="editText">
				<input type="text" class="text-black text-center" v-model="editValue" size="1" ref="editBox"
					v-on:keypress="event => { if (event.key == 'Enter') editClicked(); }" />
			</span>
			<span v-else>
				{{ item }}
			</span>
		</div>
		<div v-if="editMode" class="flex flex-col w-full">
			<div class="flex flex-row">
				<PokerChoiceEdit class="bg-blue-500 rounded-bl-lg border-r-2 border-black" v-on:click="editClicked">
					{{ editText ? '✅' : '✍️' }}
				</PokerChoiceEdit>
				<PokerChoiceEdit class="bg-red-800 rounded-br-lg" v-on:click="onRemove">
					🗑️
				</PokerChoiceEdit>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: ['item', 'selected', 'cardClicked', 'editMode', 'onEdited', 'onRemove', 'onMove'],
	data() {
		return {
			editText: false,
			editValue: ''
		}
	},

	methods: {
		editClicked() {
			if (this.editText) {
				this.editText = false;
				if (this.onEdited)
					this.onEdited(this.editValue)
			} else {
				this.editText = true;
				this.editValue = this.item;

				setTimeout(() => {
					this.$refs.editBox.select();
				}, 10);
			}
		}
	}
}
</script>