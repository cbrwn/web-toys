<template>
    <div class="relative">
        <div class="flex justify-center items-center absolute z-50" v-if="canvasRendering" :style="`width:${canvasSize}px; height:${canvasSize}px;`" :class="{ ['cursor-pointer']: !spinning }" v-on:click="newRotate" >
            <div class="flex justify-center items-center text-4xl select-none rounded-full bg-gray-300 w-28 h-28">
                <div class="absolute w-0 h-0 border-b-gray-300" style="margin-top: -120px; border-left: 30px solid transparent; border-right: 30px solid transparent; border-bottom: 50px solid rgb(209 213 219);"></div>
            </div>
        </div>
        <canvas class="w-min transition-transform pointer-events-none" @transitionend="onSpinEnd"
            @webkitTransitionend="onSpinEnd" :style="rotateStyle" ref="wheel" :width="canvasSize"
            :height="canvasSize" />
    </div>
</template>

<script>
export default {
    props: {
        items: Array,
        spinCount: { // number of times to spin before landing on the chosen item
            type: Number,
            default: 6
        }
    },
    mounted: function () {
        document.fonts.ready.then(() => this.drawCanvas());
    },
    data() {
        let newRotateDeg = Math.random() * 360;
        return {
            canvasRendering: false,
            rotateEndDeg: newRotateDeg,
            spinning: false,
            selectedItem: 0,
            canvasSize: 400
        }
    },
    watch: {
        items: function(){
            this.drawCanvas();
        }
    },
    computed: {
        rotateStyle: function () {
            let timingFunc = 'cubic-bezier(.35,-0.1,.02,1)';
            return {
                '-webkit-transform': `rotateZ(${this.rotateEndDeg}deg)`,
                transform: `rotateZ(${this.rotateEndDeg}deg)`,
                '-webkit-transition-duration': `${this.rotateDuration}s`,
                'transition-duration': `${this.rotateDuration}s`,
                '-webkit-transition-timing-function:': timingFunc,
                'transition-timing-function': timingFunc
            }
        },
        rotateDuration: function () {
            return this.spinning ? 8 : 0;
        },
        canSpin: function () {
            return !this.spinning;
        }
    },
    methods: {
        newRotate: function (event) {
            if (!this.canSpin) return;

            let itemIndex = Math.floor(Math.random() * this.items.length);
            this.selectedItem = itemIndex;
            let itemAngle = this.getAngleForItem(itemIndex);

            this.rotateEndDeg = (360 * this.spinCount) + itemAngle;
            this.spinning = true;

            this.$emit('spinStart');
        },
        onSpinEnd: function () {
            this.spinning = false;
            // get rid of the extra spins, ready for next spin
            this.rotateEndDeg %= 360;

            this.$emit('spinEnd', { item: this.items[this.selectedItem], itemIndex: this.selectedItem });
        },
        drawCanvas: function () {
            const canvas = this.$refs.wheel;
            if (canvas.getContext) {
                const ctx = canvas.getContext("2d");
                const radius = canvas.width / 2;
                const sliceAngle = (Math.PI * 2) / (this.items.length);


                ctx.font = `24px Itim`

                for (let i = 0; i < this.items.length; ++i) {
                    let startAngle = sliceAngle * i - (Math.PI / 2);

                    let colours = this.getColourForString(this.items[i]);
                    ctx.fillStyle = colours.bg;
                    ctx.beginPath();
                    ctx.beginPath()
                    const borderWidth = 0;
                    ctx.arc(radius, radius, radius - borderWidth, startAngle, startAngle + sliceAngle, false)
                    ctx.arc(radius, radius, 0, startAngle + sliceAngle, startAngle, true)
                    ctx.fill()

                    ctx.save();
                    ctx.fillStyle = colours.fg;
                    const textOffset = radius - 20;
                    ctx.translate(radius + Math.cos(startAngle + sliceAngle / 2) * textOffset, radius + Math.sin(startAngle + sliceAngle / 2) * textOffset);
                    ctx.rotate(startAngle + sliceAngle / 2 + Math.PI)
                    ctx.fillText(this.items[i], 0, 5);

                    ctx.restore()
                }
                this.canvasRendering = true;
            }
        },
        getAngleForItem: function (itemIndex) {
            const angleBetweenItems = 360 / this.items.length;
            return 360 - ((angleBetweenItems * itemIndex) + (Math.random() * angleBetweenItems));
        },
        getColourForString(text) {
            let val = 1;
            // some random-ish stuff based on string
            for(let i = 0; i < text.length; ++i) {
                val ^= Math.imul(val ^ (text.charCodeAt(i) * i), 597399067);
            }
            let r = (val & 0xff0000) >> 16;
            let g = (val & 0xff00) >> 8;
            let b = (val & 0xff);

            const brightness = Math.round(((parseInt(r) * 299) +
                      (parseInt(g) * 587) +
                      (parseInt(b) * 114)) / 1000);

            return {bg: `rgb(${r}, ${g}, ${b})`, fg: ((brightness > 125) ? '#1d1d1d' : '#d9d8f1')};
        }
    }
}
</script>