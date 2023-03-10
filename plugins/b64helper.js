export default defineNuxtPlugin(() => {
	return {
		provide: {
			b64ToItems: (str) => {
				const arr = str.split(',');
				return { items: JSON.parse(atob(arr[0])), bench: JSON.parse(atob(arr[1])) };
			},
			itemsToB64: (i, b) => {
				let itemsString = JSON.stringify(i);
				let benchString = JSON.stringify(b);

				return `${btoa(itemsString)},${btoa(benchString)}`;
			}
		}
	}
});