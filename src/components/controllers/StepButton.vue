<script setup lang="ts">
import type { IMessageControllerConfigs, LedStatus, StepStyle } from "@/services/types/devices";
import { ref } from "vue";
import LcdDisplay from "./LcdDisplay.vue";
import ControllerLabel from "./ControllerLabel.vue";
import CaretLeftIcon from "../icons/CaretLeftIcon.vue";
import CaretRightIcon from "../icons/CaretRightIcon.vue";
import LightLed from "./LightLed.vue";

const emit = defineEmits<{
    (event: "changevalue", value: number): void;
}>();
const props = defineProps<{
    controller: IMessageControllerConfigs;
    invert: boolean;
    style: StepStyle;
}>();
const currentValue = ref<number>(props.controller.value || Math.round(((props.controller.minValue as number) + (props.controller.maxValue as number)) / 2));

let changeTimeout: NodeJS.Timeout | null = null;
let initialValue = props.controller.value || Math.round(((props.controller.minValue as number) + (props.controller.maxValue as number)) / 2);
let newTimeoutValue = props.controller.value || Math.round(((props.controller.minValue as number) + (props.controller.maxValue as number)) / 2);

const ledStatus = ref<LedStatus>("off");

function incrementValue() {
    if (currentValue.value >= (props.controller.maxValue as number)) return false;
    
    newTimeoutValue = currentValue.value;
    currentValue.value = currentValue.value + 1;
    
    changeValue();

    return true;
}

function decrementValue() {
    if (currentValue.value <= (props.controller.minValue as number)) return false;
    
    newTimeoutValue = currentValue.value;
    currentValue.value = currentValue.value - 1;

    changeValue();

    return true;
}

function incrementLed() {
    if (!incrementValue()) return;

    ledStatus.value = "on";
    setTimeout(() => {
        ledStatus.value = "off";
    }, 100);
}

function decrementLed() {
    if (!decrementValue()) return;
    
    ledStatus.value = "on";
    setTimeout(() => {
        ledStatus.value = "off";
    }, 100);
}

function changeValue() {
    if (changeTimeout) clearTimeout(changeTimeout);
    
    changeTimeout = setTimeout(() => {
        if (initialValue === currentValue.value) return;
        
        emit("changevalue", currentValue.value);
        initialValue = currentValue.value;
        changeTimeout = null;
    }, 250);
}
</script>

<template>
    <div class="flex flex-col items-center step-controller">
        <template v-if="style === 'arrow'">
            <LcdDisplay
                :invert="invert"
                :value="currentValue.toString()"
                :minimal="true"
            />
            <div class="flex flex-row mt-1 gap-2">
                <button type="button" class="btn shadow rounded-sm py-0.5 border-3d" style="background-color: #969895;" @click="decrementValue">
                    <CaretLeftIcon class="select-none text-sm" />
                </button>
                <button type="button" class="btn shadow rounded-sm py-0.5 border-3d" style="background-color: #969895;" @click="incrementValue">
                    <CaretRightIcon class="select-none text-sm" />
                </button>
            </div>
        </template>
        <template v-if="style === 'dot'">
            <div class="flex flex-row mt-1 gap-2">
                dot layout like triaxis modes
            </div>
        </template>
        <template v-if="style === 'adam'">
            <div class="flex flex-col mt-1 w-11 shadow rounded-sm" style="background-color: #0087ca;">
                <button type="button" class="btn py-2 h-8 aspect-square" @click="incrementLed">
                    <LightLed :status="ledStatus" />
                </button>
                <button type="button" class="btn py-2 h-8 aspect-square" @click="decrementLed">
                </button>
            </div>
        </template>
        <ControllerLabel v-if="controller.label" :label="controller.label" :invert="invert" />
    </div>
</template>

<style scoped lang="scss">
.step-controller:not(:hover) label {
    opacity: 80%;
}
</style>