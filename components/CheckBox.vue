<template>
	<div class="checkbox w-7 h-7 bg-white border-gray-400 border rounded">
		<img src="/checkmark.svg" v-if="checked" />
	</div>
</template>

<script>
export default {
	props: ['checked']
}
</script>