<script setup lang="ts">
import type { IMessageControllerConfigs, RotaryStyle } from "@/services/types/devices";
import { ref, computed, onMounted, onUnmounted } from "vue";
import ControllerLabel from "./ControllerLabel.vue";
import { getOffset } from "./../../services/classes/Utils";

const emit = defineEmits<{
    (event: "changevalue", value: number): void;
}>();
const props = withDefaults(
    defineProps<{
        controller: IMessageControllerConfigs;
        invert: boolean;
        beginDeg?: number;
        lengthDeg?: number;
        // snapInMotion?: boolean;
        // minimumOverMaximum?: boolean;
        // step?: number;
        style: RotaryStyle;
    }>(),
    {
        beginDeg: 45,
        lengthDeg: 270,
        // snapInMotion: false,
        // minimumOverMaximum: true,
        // step: 1,
    }
);
const rotary = ref<HTMLElement>();
const currentValue = ref<number>(props.controller.value || ((props.controller.minValue as number) + (props.controller.maxValue as number)) / 2);
const steps = (props.controller.maxValue as number) - (props.controller.minValue as number);
const maxDeg = props.beginDeg + props.lengthDeg;
const degPerStep = props.lengthDeg / steps;
const rotate = computed(() => currentValue.value * degPerStep - props.beginDeg - 135);
const rotateStyle = computed(() => `${rotate.value}deg`);

let startY = 0;
let direction = 0;
let movement = 0;
let isChanging = false;

let changeTimeout: number | null = null;
let wheelEmitTimeout: number | null = null;

function onMouseWheel(e: WheelEvent) {
    e.preventDefault();
    if (e.deltaY < 0 && currentValue.value < (props.controller.maxValue as number)) {
        currentValue.value++;
    } else if (currentValue.value > (props.controller.minValue as number)) {
        currentValue.value--;
    }
    // Debounce: emit MIDI when user stops scrolling the wheel
    if (wheelEmitTimeout) clearTimeout(wheelEmitTimeout);
    wheelEmitTimeout = window.setTimeout(() => {
        emit("changevalue", currentValue.value);
        wheelEmitTimeout = null;
    }, 500);
}

function onMouseDown(e: MouseEvent) {
    if (changeTimeout) clearTimeout(changeTimeout);
    if (e.ctrlKey) {
        resetToMiddleValue();
    } else {
        startMouseRotation(e);
    }
}

function onMouseMove(e: MouseEvent) {
    const degrees = calculateMoveDeg(e.pageY);
    if (degrees !== movement) {
        isChanging = true;
        movement = degrees;
        currentValue.value = Math.round(degrees / degPerStep);
    }
    degPerStep;
}

function onMouseUp() {
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mousemove", onMouseMove);
    if (isChanging) {
        isChanging = false;
        changeTimeout = setTimeout(() => {
            emit("changevalue", currentValue.value);
            changeTimeout = null;
        }, 250);
    }
}

function startMouseRotation(e: MouseEvent) {
    const initialPageY = e.pageY;
    direction = rotary.value && e.pageX > getOffset(rotary.value || null).left ? -1 : 1;
    const minVal = props.controller.minValue as number;
    const currentAngle = props.beginDeg + (currentValue.value - minVal) * degPerStep;
    startY = currentAngle - initialPageY * direction;
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
}

function resetToMiddleValue() {
    currentValue.value = Math.round(steps / 2);
}

function onTouchStart(event: TouchEvent) {
    event.preventDefault();
}

function calculateMoveDeg(mouseY: number): number {
    let diff = (startY + mouseY * direction) % 360;
    if (diff > maxDeg /*|| (startY - mouseY) / 360 > 1*/) {
        diff = maxDeg;
    } else if (diff < props.beginDeg) {
        diff = props.beginDeg;
    }

    const steps = Math.round(diff / degPerStep);

    return steps * degPerStep;
}

onMounted(() => {
    if (rotary.value) rotary.value.addEventListener("wheel", onMouseWheel, { passive: false });
});

onUnmounted(() => {
    if (wheelEmitTimeout) clearTimeout(wheelEmitTimeout);
    if (rotary.value) rotary.value.removeEventListener("wheel", onMouseWheel);
});
</script>

<template>
    <div class="rotary-controller flex flex-col items-center" :title="controller.label">
        <div
            ref="rotary"
            class="rotaryswitchPlugin"
            :class="style"
            @mousedown.prevent="onMouseDown"
            @touchstart.prevent="onTouchStart"
            @dblclick.prevent="resetToMiddleValue"
        >
            <input
                type="number"
                :min="controller ? controller.minValue : 0"
                :max="controller ? controller.maxValue : 127"
                v-model="currentValue"
                :hidden="true"
            />
            <div class="switch" :style="{ transform: `rotate(${rotateStyle})` }"></div>
        </div>
        <ControllerLabel v-if="controller" :label="controller.label" :invert="invert" />
    </div>
</template>

<style scoped lang="scss">
.rotaryswitchPlugin {
    @apply relative cursor-pointer shadow-md rounded-full active:cursor-ns-resize;
    width: 51px;
    height: 51px;
    background-size: 51px;
    background-repeat: no-repeat;
    &.dark {
        background-image: url(/darkBackground.png);
        .switch {
            background-image: url(/darkFront.png);
        }
    }
    &.light {
        background-image: url(/lightBackground.png);
        .switch {
            background-image: url(/lightFront.png);
        }
    }
    &.metal {
        background-image: url(/metalBackground.png);
        .switch {
            background-image: url(/metalFront.png);
        }
    }
}

.rotaryswitchPlugin .switch {
    @apply w-full h-full;
    background-size: 51px;
    background-repeat: no-repeat;
}

.rotary-controller:not(:hover) label {
    opacity: 80%;
}
</style>
