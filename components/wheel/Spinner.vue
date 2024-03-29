<template>
  <div class="relative">
    <div
      class="flex justify-center items-center absolute z-50"
      v-if="canvasRendering"
      :style="`width:${canvasSize}px; height:${canvasSize}px;`"
      :class="{ ['cursor-pointer']: !spinning }"
      v-on:click="newRotate"
    >
      <div
        class="flex justify-center items-center text-4xl select-none rounded-full bg-gray-300 w-28 h-28"
      >
        <div
          class="absolute w-0 h-0 border-b-gray-300"
          style="
            margin-top: -120px;
            border-left: 30px solid transparent;
            border-right: 30px solid transparent;
            border-bottom: 50px solid rgb(209 213 219);
          "
        ></div>
      </div>
    </div>
    <canvas
      class="w-min transition-transform pointer-events-none"
      @transitionend="onSpinEnd"
      @webkitTransitionend="onSpinEnd"
      :style="rotateStyle"
      ref="wheel"
      :width="canvasSize"
      :height="canvasSize"
    />
  </div>
</template>

<script>
export default {
  props: {
    items: Array,
    spinCount: {
      // number of times to spin before landing on the chosen item
      type: Number,
      default: 6,
    },
  },
  mounted: function () {
    // wait for our font from google fonts to be loaded before drawing
    document.fonts.ready.then(() => this.drawCanvas());
  },
  data() {
    return {
      canvasRendering: false, // use to hide DOM elements until canvas has rendered
      destRotation: 0,
      spinning: false,
      selectedItem: 0,
      canvasSize: 400,
    };
  },
  watch: {
    items: function () {
      // update wheel drawing when items change
      this.drawCanvas();
    },
  },
  computed: {
    rotateStyle: function () {
      let timingFunc = "cubic-bezier(.35,-0.1,.02,1)";
      return {
        "-webkit-transform": `rotateZ(${this.destRotation}deg)`,
        transform: `rotateZ(${this.destRotation}deg)`,

        "-webkit-transition-duration": `${this.rotateDuration}s`,
        "transition-duration": `${this.rotateDuration}s`,

        "-webkit-transition-timing-function:": timingFunc,
        "transition-timing-function": timingFunc,
      };
    },
    rotateDuration: function () {
      // insta-set rotation if we're not actively spinning
      return this.spinning ? 8 : 0;
    },
    canSpin: function () {
      return !this.spinning;
    },
  },
  methods: {
    newRotate: function (event) {
      if (!this.canSpin) return;

      let itemIndex = Math.floor(Math.random() * this.items.length);
      this.selectedItem = itemIndex;

      const angleBetweenItems = 360 / this.items.length;
      let itemAngle =
        360 -
        (angleBetweenItems * itemIndex + Math.random() * angleBetweenItems);

      this.destRotation = 360 * this.spinCount + itemAngle;
      this.spinning = true;

      this.$emit("spinStart");
    },
    onSpinEnd: function () {
      this.spinning = false;
      // get rid of the extra spins, ready for next spin
      this.destRotation %= 360;

      this.$emit("spinEnd", {
        item: this.items[this.selectedItem],
        itemIndex: this.selectedItem,
      });
    },
    drawCanvas: function () {
      const canvas = this.$refs.wheel;
      if (canvas.getContext) {
        const ctx = canvas.getContext("2d");
        const radius = canvas.width / 2;
        const sliceAngle = (Math.PI * 2) / this.items.length;
        const defaultFontSize = 28;

        for (let i = 0; i < this.items.length; ++i) {
          let startAngle = sliceAngle * i - Math.PI / 2;

          let colours = this.getColourForString(this.items[i]);
          ctx.fillStyle = colours.bg;
          ctx.beginPath();
          ctx.arc(
            radius,
            radius,
            radius,
            startAngle,
            startAngle + sliceAngle,
            false
          );
          ctx.arc(radius, radius, 0, startAngle + sliceAngle, startAngle, true);
          ctx.fill();

          ctx.save();

          // size font to fit :)
          ctx.font = `${defaultFontSize}px Itim`;
          let thisFontSize = defaultFontSize;
          let iterations = 0;
          while (ctx.measureText(this.items[i]).width > 120) {
            thisFontSize -= 1;
            ctx.font = `${thisFontSize}px Itim`;

            if (iterations > 100) break;
          }

          ctx.fillStyle = colours.fg;
          const textOffset = radius - 20;
          ctx.translate(
            radius + Math.cos(startAngle + sliceAngle / 2) * textOffset,
            radius + Math.sin(startAngle + sliceAngle / 2) * textOffset
          );
          ctx.rotate(startAngle + sliceAngle / 2 + Math.PI);
          ctx.fillText(this.items[i], 0, thisFontSize / 4);

          ctx.restore();
        }
        this.canvasRendering = true;
      }
    },
    getColourForString(text) {
      let val = 1;
      // some random-ish stuff based on string
      for (let i = 0; i < text.length; ++i) {
        val ^= Math.imul(val ^ (text.charCodeAt(i) * i), 597399067);
      }
      let r = (val & 0xff0000) >> 16;
      let g = (val & 0xff00) >> 8;
      let b = val & 0xff;

      // W3C recommended brightness things
      const brightness = Math.round(
        (parseInt(r) * 299 + parseInt(g) * 587 + parseInt(b) * 114) / 1000
      );

      return {
        bg: `rgb(${r}, ${g}, ${b})`,
        fg: brightness > 125 ? "#2d241d" : "#f9f8f1",
      };
    },
  },
};
</script>
