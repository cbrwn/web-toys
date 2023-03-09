<template>
    <canvas 
        class="w-min transition-transform" 
        :class="{['cursor-pointer']: !spinning}"
        @transitionend="onSpinEnd"
        @webkitTransitionend="onSpinEnd"
        v-on:click="newRotate" 
        :style="rotateStyle" 
        ref="wheel" 
        width="400" height="400" 
    />
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
        let newRotateDeg = Math.random()*360;
        return {
            rotateEndDeg: newRotateDeg,
            spinning: false,
            selectedItem: 0
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
        rotateDuration: function() {
            return this.spinning ? 8 : 0;
        },
        canSpin: function() {
            return !this.spinning;
        }
    },
    methods: {
        newRotate: function(event) {
            if(!this.canSpin) return;

            let itemIndex = Math.floor(Math.random()*this.items.length);
            this.selectedItem = itemIndex;
            let itemAngle = this.getAngleForItem(itemIndex);

            this.rotateEndDeg = (360*this.spinCount) + itemAngle;
            this.spinning = true;

            this.$emit('spinStart');
        },
        onSpinEnd: function() {
            this.spinning = false;
            // get rid of the extra spins, ready for next spin
            this.rotateEndDeg %= 360;

            this.$emit('spinEnd', {item: this.items[this.selectedItem], itemIndex: this.selectedItem});
        },
        drawCanvas: function () {
            const canvas = this.$refs.wheel;
            if (canvas.getContext) {
                const ctx = canvas.getContext("2d");
                const radius = canvas.width / 2;
                const sliceAngle = (Math.PI * 2) / (this.items.length);


                ctx.font = `24px Itim`

                for (let i = 0; i < this.items.length; ++i) {
                    let startAngle = sliceAngle * i - (Math.PI/2);

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
        },
        getAngleForItem: function(itemIndex) {
            const angleBetweenItems = 360/this.items.length;
            return 360 - ((angleBetweenItems*itemIndex) + (Math.random() * angleBetweenItems));
        }
    }
}
</script>