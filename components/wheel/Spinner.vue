<template>
    <canvas class="w-min transition-transform" v-on:click="newRotate" :style="rotateStyle" ref="wheel" width="400" height="400" />
</template>

<script>
export default {
    props: ['items'],
    mounted: function () {
        this.drawCanvas();
    },
    data() {
        let newRotateDeg = Math.random()*360;
        return {
            rotateEndDeg: newRotateDeg
        }
    },
    computed: {
        rotateStyle: function () {
            return {
                '-webkit-transform': `rotateZ(${this.rotateEndDeg}deg)`,
                transform: `rotateZ(${this.rotateEndDeg}deg)`,
                '-webkit-transition-duration': `${this.rotateDuration}s`,
                'transition-duration': `${this.rotateDuration}s`,
                '-webkit-transition-timing-function:': this.timingFun,
                'transition-timing-function': this.timingFun
            }
        }
    },
    methods: {
        newRotate: function(event) {
            let newRotateDeg = Math.random()*360;
            this.rotateEndDeg = newRotateDeg;
        },
        drawCanvas: function () {
            const canvas = this.$refs.wheel;
            console.log(canvas.width);
            if (canvas.getContext) {
                const ctx = canvas.getContext("2d");
                const radius = canvas.width / 2;
                const sliceAngle = (Math.PI * 2) / (this.items.length);
                console.log(this.items.length);
                console.log(sliceAngle);


                ctx.font = `24px Itim`

                for (let i = 0; i < this.items.length; ++i) {
                    let startAngle = sliceAngle * i;

                    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
                    ctx.beginPath();
                    ctx.beginPath()
                    const borderWidth = 0;
                    ctx.arc(radius, radius, radius - borderWidth, startAngle, startAngle + sliceAngle, false)
                    ctx.arc(radius, radius, 0, startAngle + sliceAngle, startAngle, true)
                    ctx.fill()

                    ctx.save();
                    ctx.fillStyle = "#000000";
                    const textOffset = radius - 20;
                    ctx.translate(radius + Math.cos(startAngle + sliceAngle / 2) * textOffset, radius + Math.sin(startAngle + sliceAngle / 2) * textOffset);
                    ctx.rotate(startAngle + sliceAngle / 2 + Math.PI)
                    ctx.fillText(this.items[i], 0, 5);

                    ctx.restore()
                }
            }
        }
    }
}
</script>