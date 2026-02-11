<script setup lang="ts">
import { computed } from "vue";
import ControllerLabel from "./ControllerLabel.vue";

const props = defineProps<{
    label?: string;
    invert: boolean;
    value?: string;
    note?: number;
    minimal?: boolean;
}>();
const currentValue = computed(() => formatValueOutput(props.value || ""));
const currentNote = computed(() => formatNoteOutput(props.note || ""));

function formatValueOutput(value: number | string = "") {
    return ("" + value).substring(-3);
}

function formatNoteOutput(value: number | "") {
    const notes = ["c", "c#", "d", "e", "f", "f#", "g", "a♭", "a", "b♭", "b"];
    return value !== "" ? notes[(value - 1) % 11] + Math.floor((value - 1) / 11).toFixed() : "";
}
</script>

<template>
    <div class="flex flex-col items-center">
        <div class="flex items-center flex-row justify-center border-3d px-1 relative" :class="[invert ? 'invert bg-white' : 'bg-black', minimal ? 'w-12' : 'w-20']">
            <div class="w-12 relative">
                <!-- LCD backlight: same padding as input so rects align with digits; width = 1ch per digit -->
                <div
                    class="lcd-backlight"
                    :class="{ invert: invert, 'mt-1': !minimal, 'pr-[9px]': minimal, 'pt-[3px] pr-[9px] pb-[3px] pl-[1px]': !minimal }"
                    aria-hidden="true"
                >
                    <!-- Invisible "0" forces font load so 1ch is valid; backlight rects use 1ch width -->
                    <span class="absolute opacity-0 pointer-events-none select-none">0</span>
                    <div class="w-[calc(1ch-1.5px)] min-w-[0.2rem] min-h-[1.75rem] shrink-0 rounded-sm bg-red-500/20" />
                    <div class="w-[calc(1ch-1.5px)] min-w-[0.2rem] min-h-[1.75rem] shrink-0 rounded-sm bg-red-500/20" />
                    <div class="w-[calc(1ch-1.5px)] min-w-[0.2rem] min-h-[1.75rem] shrink-0 rounded-sm bg-red-500/20" />
                </div>
                <div
                    class="absolute w-12 font-digital text-2xl select-none cursor-default pointer-events-none text-off/40 text-center z-10"
                    :class="{ invert: invert, 'mt-1': !minimal }"
                >
                    888
                </div>
                <input
                    type="text"
                    v-model="currentValue"
                    readonly
                    maxlength="3"
                    class="font-digital w-12 text-2xl select-none cursor-default pointer-events-none bg-black/0 text-on z-20 text-right"
                    :class="[invert ? 'invert bg-black/0' : '', minimal ? 'pr-2' : 'm-1']"
                />
            </div>
            <div class="absolute top-0 right-0" v-if="!minimal">
                <small class="absolute right-0 mr-1 font-digital text-off/40" :class="{ invert: invert }">888</small>
                <small class="absolute right-0 mr-1 font-digital text-on z-10" :class="{ invert: invert }">{{ currentNote }}</small>
            </div>
        </div>
        <ControllerLabel v-if="label" :label="label" :invert="invert" />
    </div>
</template>

<style scoped lang="scss">
.lcd-backlight {
    @apply absolute inset-0 w-12 min-h-[1.75rem] flex gap-[1px] justify-end items-stretch font-digital text-2xl z-0 pointer-events-none text-transparent box-border
}
</style>
