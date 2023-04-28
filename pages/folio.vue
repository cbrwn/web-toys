<template>
	<div class="flex flex-col items-center">
		<div class="w-full flex flex-col items-center">
			<div class="flex flex-col items-center justify-center h-32 mt-24">
				<h1 class="text-4xl">cameron brown</h1>
				<h3 class="text-lg -mt-2 opacity-50">software engineer</h3>
			</div>

			<div class="w-full lg:w-4/5 px-5 flex flex-col items-center gap-16 mb-5">
				<FolioProjectGroup :projects="professionalProjects">
					professional projects
				</FolioProjectGroup>

				<FolioProjectGroup :projects="personalProjects">
					personal projects
				</FolioProjectGroup>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			projects: [
				{
					name: "fsh.zone",
					category: "personal",
					url: "https://fsh.zone",
					image: "/folio/fshzone.png",
					gif: "/folio/fshzone.gif",
					tech: ['C#', 'Unity', 'JavaScript', 'Node.js' ],
					time: "2019 - 2020",
					desc: "gather with friends to catch fishes and hang out in this small online game!\nfsh.zone began as a personal project to accelerate my learning at university and continued as my team's final year project at AIE",
				},
				{
					name: "web toys",
					category: "personal",
					url: "https://cmrn.io",
					image: "/folio/poker.png",
					gif: "/folio/poker.gif",
					tech: ['JavaScript', 'Node.js', 'Vue', 'Nuxt'],
					time: "2023",
					desc: "I started making small web tools and toys in my spare time to expand my skills and learn some frontend development\nprojects include a 'wheel of fortune,' a small quiz toy, and a fun agile poker implementation"
				},
				{
					name: "Real Racing Next",
					category: "professional",
					image: "/folio/rrn.png",
					tech: ['C++', 'C#', 'Go'],
					time: "2022 - 2023",
					desc: "the next generation of the Real Racing franchise\nI joined the team after some time in development, helping build features from the ground up to create a genre-defining mobile racing game"
				},
				{
					name: "Real Racing 3",
					category: "professional",
					url: "https://www.ea.com/games/real-racing/real-racing-3",
					image: "/folio/rr3.png",
					gif: "/folio/rr3.gif",
					time: "2020 - 2022",
					tech: ['C++', 'C#'],
					desc: "the definitive mobile racing game, with a ton of road cars and numerous motorsports franchises to experience\nI joined the RR3 team in 2020 and helped ship some of its biggest updates, supporting the 10-year-old game as a successful live service"
				},
				{
					name: "Unfamiliar",
					category: "professional",
					url: "https://store.steampowered.com/app/1163150/Unfamiliar/",
					image: "/folio/unfamiliar.png",
					gif: "/folio/unfamiliar.gif",
					time: "2019",
					tech: ['C#', 'Unity'],
					desc: "a cute and relaxing cat-based adventure game\nI joined the team towards the end of development, quickly picking up the project and carrying it through to shipping"
				},
				{
					name: "Sprilo",
					category: "personal",
					url: "https://cmrn.itch.io/sprilo",
					image: "/folio/sprilo.png",
					gif: "/folio/sprilo.gif",
					time: "2017",
					tech: ['Assembly', 'NES'],
					desc: "a simple time-trial racing game for the NES with multiple tracks and difficulty settings\nwritten from scratch in 6502 Assembly for the 2017 GitHub Game Off, I wanted to test my ability to quickly learn a totally unfamiliar system & language and had a whole lot of fun!"
				}
			]
		};
	},
	created() {
		document.title = "cameron brown - portfolio";
	},
	computed: {
		personalProjects() {
			return this.projects.filter(project => project.category === "personal");
		},
		professionalProjects() {
			return this.projects.filter(project => project.category === "professional");
		}
	}
};

definePageMeta({
	layout: "empty",
});
</script>
