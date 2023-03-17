// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		'@nuxtjs/tailwindcss',
		'nuxt-socket-io'
	],
	io: {
		sockets: [ // Required
			{ // At least one entry is required
				name: 'poker',
				//url: 'http://localhost:3000',
				default: true
			},
		]
	},
	ssr: false
})
