<script setup lang="ts">
import type { IMessageControllerConfigs } from "@/services/types/devices";
import { ref } from "vue";
import LcdDisplay from "./LcdDisplay.vue";
import ControllerLabel from "./ControllerLabel.vue";
import CaretLeftIcon from "../icons/CaretLeftIcon.vue";
import CaretRightIcon from "../icons/CaretRightIcon.vue";

const emit = defineEmits<{
    (event: "changevalue", value: number): void;
}>();
const props = withDefaults(
    defineProps<{
        controller: IMessageControllerConfigs;
        invert: boolean;
        // snapInMotion?: boolean;
        // minimumOverMaximum?: boolean;
        // step?: number;
        // style: RotaryStyle;
    }>(),
    {
        // snapInMotion: false,
        // minimumOverMaximum: true,
        // step: 1,
    }
);
const currentValue = ref<number>(props.controller.value || Math.round(((props.controller.minValue as number) + (props.controller.maxValue as number)) / 2));

let changeTimeout: NodeJS.Timeout | null = null;
let initialValue = props.controller.value || Math.round(((props.controller.minValue as number) + (props.controller.maxValue as number)) / 2);
let newTimeoutValue = props.controller.value || Math.round(((props.controller.minValue as number) + (props.controller.maxValue as number)) / 2);

function incrementValue() {
    if (currentValue.value >= (props.controller.maxValue as number)) return;
    
    newTimeoutValue = currentValue.value;
    currentValue.value = currentValue.value + 1;
    
    changeValue();
}

function decrementValue() {
    if (currentValue.value <= (props.controller.minValue as number)) return;
    
    newTimeoutValue = currentValue.value;
    currentValue.value = currentValue.value - 1;

    changeValue();
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
    <div class="flex flex-col items-center">
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
        <ControllerLabel v-if="controller.label" :label="controller.label" :invert="invert" />
    </div>
</template>