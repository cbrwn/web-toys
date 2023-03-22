<template>
	<div class="absolute top-0 left-0 w-full h-full">
		<canvas class="w-full h-full pointer-events-none -z-10" ref="canvas"></canvas>
	</div>
</template>

<script>
export default {
	data() {
		return {
			emojis: [ ]
		}
	},
	created() {
		window.requestAnimationFrame(this.draw);
	},
	methods: {
		draw() {
			const canvas = this.$refs.canvas;
			if(canvas == null) {
				window.requestAnimationFrame(this.draw);
				return;
			}
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
			const ctx = canvas.getContext('2d');
			const width = canvas.width;
			const height = canvas.height;

			ctx.clearRect(0, 0, width, height);

            ctx.font = `44px Itim`;
			ctx.fillStyle = '#ffffff88';

			const rotateMax = Math.PI/8;

			for(let i = 0; i < this.emojis.length; i++) {
				ctx.save();
				let x = this.emojis[i].x * width;
				let y = this.emojis[i].y * height;
				let r = this.emojis[i].r;
				let emoji = this.emojis[i].emoji;
				ctx.translate(x, y);
				ctx.rotate((r * rotateMax) - rotateMax);
				ctx.fillText(emoji, 0, 0);

				ctx.restore();

				this.emojis[i].y -= 0.01;

				if(this.emojis[i].y < -0.1) {
					this.emojis.splice(i, 1);
					i--;
				}
			}


			window.requestAnimationFrame(this.draw);
		},
		addEmoji(emoji) {
			this.emojis.push({emoji: emoji, x: Math.random() * 0.8, y: 1.2, r: Math.random()});
		}
	}
}
</script>