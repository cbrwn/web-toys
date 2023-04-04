<template>
  <div
    class="absolute top-0 left-0 w-full h-full"
    v-if="isConsensus && this.animationRunning"
  >
    <canvas class="w-full h-full" ref="canvas"></canvas>
  </div>
</template>

<script>
import Easing from "easing-functions";
const QO = Easing.Quadratic.Out;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// rand between
function rb(min, max) {
  return Math.random() * (max - min) + min;
}

function drawStrokedText(ctx, text, x, y, strokeSize, strokeColor) {
  ctx.lineWidth = strokeSize;
  ctx.strokeStyle = strokeColor;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

export default {
  props: ["isConsensus", "isMegaConsensus", "voteCount", "consensusValue"],
  data() {
    return {
      animationStart: 0,
      lastVoteCount: -1,

      animationStates: [0.5, 1.0, 5.0, 2.0, 1.0],
      animationRunning: false,
      lastFrameTime: 0,

      confettis: [],
    };
  },
  watch: {
    isConsensus(newVal, oldVal) {
      if (
        newVal &&
        this.voteCount != this.lastVoteCount &&
        this.consensusValue != undefined
      ) {
        this.lastVoteCount = this.voteCount;
        this.animationRunning = true;
        this.animationStart = Date.now();
        this.lastFrameTime = this.animationStart;

        this.confettis = [];
        for (let i = 0; i < 100; ++i) {
          this.confettis.push({
            x: Math.random(),
            y: -rb(50, 300),
            r: 0,
            dr: rb(-10, 10),
            dy: rb(0.05, 0.2),
            // give random colour
            c: "#" + Math.floor(Math.random() * 16777215).toString(16),
            w: rb(10, 25),
            h: rb(5, 10)
          });
        }

        this.drawCanvas();
      }
    },
  },
  methods: {
    drawRegularConsensus(ctx, width, height, dt) {
      let totalTime = (Date.now() - this.animationStart) / 1000;
      let currentAnimationState = this.animationStates.length - 1;
      let lastStateVal = 0;
      for (let i = 0; i < this.animationStates.length - 1; i++) {
        if (totalTime - lastStateVal < this.animationStates[i]) {
          currentAnimationState = i;
          break;
        }

        lastStateVal += this.animationStates[i];
      }
      let t =
        (totalTime - lastStateVal) /
        this.animationStates[currentAnimationState];

      if (currentAnimationState == this.animationStates.length - 1 && t >= 1) {
        this.animationRunning = false;
        return false;
      }

      if (currentAnimationState == this.animationStates.length - 1) {
        ctx.globalAlpha = lerp(1, 0, t);
      }

      const maxOpacity = 128;
      if (currentAnimationState >= 0) {
        let tt = currentAnimationState > 0 ? 1.0 : QO(t);
        let opacityPart = Math.round(tt * maxOpacity).toString(16);
        if (opacityPart.length == 1) opacityPart = "0" + opacityPart;
        ctx.fillStyle = "#000000" + opacityPart;
        ctx.fillRect(0, 0, width, height);
      }

      if (currentAnimationState >= 1) {
        for (let confetti of this.confettis) {
          confetti.y += confetti.dy * height * dt;
          confetti.r += confetti.dr * dt;

          let drawX = confetti.x * width + (Math.sin(totalTime * confetti.dr * 0.3) * 30);

          ctx.fillStyle = confetti.c;
          ctx.save();
          ctx.translate(drawX, confetti.y);
          ctx.rotate(confetti.r);

          ctx.fillRect(
            -confetti.w/ 2,
            -confetti.h/ 2,
            confetti.w,
            confetti.h
          );

          ctx.restore();
        }

        let tt = currentAnimationState > 1 ? 1.0 : QO(t);

        ctx.font = `44px Itim`;
        ctx.fillStyle = "#ffffff";

        ctx.textAlign = "center";
        drawStrokedText(
          ctx,
          "consensus reached",
          width / 2,
          lerp(-50, height / 5, tt),
          7,
          "#000"
        );
      }

      if (currentAnimationState >= 2) {
        let tt = currentAnimationState > 2 ? 1.0 : QO(t);

        ctx.save();

        ctx.translate(width / 2, height / 2);
        ctx.scale(tt, tt);
        ctx.rotate(lerp(50, 0, tt));
        ctx.font = `250px Itim`;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        drawStrokedText(ctx, this.consensusValue, 0, 0, 20, "#000");

        ctx.restore();
      }

      return true;
    },
    drawCanvas() {
      if (!this.isConsensus) {
        this.animationRunning = false;
        return;
      }

      let dt = (Date.now() - this.lastFrameTime) / 1000;
      this.lastFrameTime = Date.now();

      const canvas = this.$refs.canvas;
      if (canvas == null) {
        window.requestAnimationFrame(this.drawCanvas);
        return;
      }
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (this.drawRegularConsensus(ctx, width, height, dt))
        window.requestAnimationFrame(this.drawCanvas);
    },
  },
};
</script>
