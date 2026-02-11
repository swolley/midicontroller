<script lang="ts" setup>
import { computed, ref } from "vue";
import { getOffset } from "./../../services/classes/Utils";

const screw = ref<HTMLElement>();
const rotate = ref<number>(Math.round(Math.random() * 360));
const style = computed(() => `${rotate.value}deg`);
const translateX = Math.random() * 2 * (Math.random() ? 1 : -1) * 1.2;
const translateY = Math.random() * 2 * (Math.random() ? 1 : -1) * 1.2;
let startY = 0;
let direction = 0;
let lastStartY = 0;

function onMouseDown(e: MouseEvent) {
    startY = e.pageY;
    direction = screw.value && e.pageX > getOffset(screw.value || null).left ? -1 : 1;
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
}

function onMouseUp() {
    lastStartY = startY;
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mousemove", onMouseMove);
}

function onMouseMove(e: MouseEvent) {
    rotate.value = calculateDeg(e.pageY);
}

function calculateDeg(mouseY: number): number {
    let diff = (startY - lastStartY - mouseY * direction) % 360;
    if (diff < 0) diff = diff + 360;
    return diff;
}
</script>

<template>
    <div class="w-6 h-6 relative">
        <div class="screw-hole">
            <div ref="screw" class="screw" :style="{ translate: `${translateX}px ${translateY}px` }" @mousedown="onMouseDown">
                <div class="screw-cut touch-none" :style="{ transform: `rotate(${style})` }"></div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.screw-hole {
    @apply absolute rounded-full w-6 h-4 my-auto;
    box-shadow: inset 0px 1px 4px;
    background-color: #222;
}
.screw {
    @apply absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-full w-5 h-5 cursor-pointer flex items-center justify-center;
    box-shadow: 1px 1px 3px;
    background-color: #404040;
}
.screw-cut {
    @apply w-11/12 h-1;
    box-shadow: inset 0px 1px 1px;
    background-color: #333;
}
</style>
