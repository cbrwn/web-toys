<template>
	<div class="flex flex-row w-full h-48 bg-gray-100 dark:bg-slate-700 rounded-3xl overflow-hidden transition-all duration-500 hover:scale-102 hover:-translate-y-2 hover:shadow-2xl"
		v-on:mouseenter="onHover" v-on:mouseleave="onLeave">
		<div class="w-3/12 flex-none relative">
			<img :src="project.image"
				class="w-full h-full absolute inset-0 transition-opacity duration-300 pointer-events-none object-cover object-center"
				:class="{ 'opacity-0': hovered && project.gif, 'opacity-100': !hovered || !project.gif }" />
			<img :src="project.gif" v-if="project.gif"
				class="w-full h-full absolute inset-0 transition-opacity duration-300 pointer-events-none object-cover object-center"
				:class="{ 'opacity-0': !hovered, 'opacity-100': hovered }" />
		</div>
		<div class="p-4 flex flex-col">
			<div class="flex flex-row items-center">
				<div>
					<div class="text-3xl font-bold">
						<a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer"
							class="underline">{{
								project.name }}</a>
						<span v-else>{{ project.name }}</span>
					</div>
					<p class="opacity-50 -mt-1 text-center">{{ project.time }}</p>
				</div>
				<div class="w-0.5 bg-black dark:bg-white opacity-50 mx-5 h-2/3"><!-- separator --></div>
				<div class="h-min flex-grow flex flex-row gap-5">
					<p v-for="(item, index) in project.tech" :key="index" :class="techStyles[item]" class="px-2 py-1 rounded-lg text-black">
						{{ item }}
					</p>
				</div>
			</div>
			<p v-for="(line, index) in (project.desc.split('\n'))" class="leading-5 mb-1">{{ line }}</p>
		</div>
	</div>
</template>

<script>
export default {
	props: ['project'],
	data() {
		return {
			hovered: false,

			techStyles: {
				'C++': 'bg-blue-500',
				'JavaScript': 'bg-yellow-500',
				'C#': 'bg-green-500',
				'Go': 'bg-red-500',
				'Unity': 'bg-purple-500',
				'Node.js': 'bg-orange-500',
				'Vue': 'bg-pink-500',
				'Nuxt': 'bg-indigo-500',
				'Assembly': 'bg-gray-400',
				'NES': 'bg-gray-300',
			}
		};
	},
	methods: {
		onHover() {
			this.hovered = true;
		},
		onLeave() {
			this.hovered = false;
		}
	}
}
</script>
