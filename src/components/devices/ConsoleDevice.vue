<script lang="ts" setup>
import DeviceContainer from "./DeviceContainer.vue";
import type { LedStatus, IConsoleLog } from "@/services/types/devices";
import { computed, onMounted, reactive, ref, watch } from "vue";
import LightLed from "@/components/controllers/LightLed.vue";
import type RackConsole from "@/stores/useConsole";
import Color from "@/services/classes/Color";
import { useWindowSize } from "@vueuse/core";

const props = defineProps<{
    collapsable: boolean;
    collapsed: boolean;
    console: RackConsole;
}>();

const logs = reactive(props.console.logs);
const ledStatus = ref<LedStatus>("off");
let blinkTimeout: number | null = null;
const currentlyCollapsed = ref<boolean>(props.collapsed);
const consoleColor = Color.createFromHex("050505");
const consoleDisplay = ref<HTMLDivElement | null>(null);
const charPerLine = ref<number>(0);
const { width    } = useWindowSize();

// Calcola la larghezza approssimativa di una lettera usando un canvas temporaneo e il font della console
function measureCharWidth(): number {
    let cachedWidth: number | null = null;
    if (cachedWidth !== null) return cachedWidth;
    
    const testChar = "8";
    const testFont = window.getComputedStyle(consoleDisplay.value!).fontFamily || "monospace";
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    // Prende anche il font-size corrente
    const fontSize = window.getComputedStyle(consoleDisplay.value!).fontSize;
    context.font = `${fontSize} ${testFont}`;
    cachedWidth = context.measureText(testChar).width || 7.5; // fallback approx if 0
    
    return cachedWidth * 0.5;
}

function calculateCharsPerLine(): number {
    if (!consoleDisplay.value) return 0;
    
    return Math.floor(consoleDisplay.value.clientWidth / measureCharWidth());
}

function formatLogClassColor(message: string) {
    if (message.indexOf("%c") === 0) {
        const splitted = message.split(/^%c(\w+)\s(color: #?[\w\d]+)(.*)$/).filter((e) => e !== "");
        return `<span style="${splitted[1]}">${splitted[0]}</span><span>${splitted[2]}</span>`;
    }
}

watch(logs, (value: IConsoleLog[]) => {
    if (!value.length) return;
    if (blinkTimeout) clearTimeout(blinkTimeout);
    ledStatus.value = value[value.length - 1].type;
    blinkTimeout = setTimeout(() => (ledStatus.value = "off"), 100);
});

watch(width, () => {
    if (!consoleDisplay.value) return;
    charPerLine.value = calculateCharsPerLine();
});

onMounted(() => {
    charPerLine.value = calculateCharsPerLine();
});
</script>

<template>
    <DeviceContainer
        class="console-device"
        :background="consoleColor"
        :collapsable="collapsable"
        :collapsed="currentlyCollapsed"
        display="horizontal"
        @togglecollapse="currentlyCollapsed = !currentlyCollapsed"
    >
        <div class="console-block">
            <LightLed class="mt-2" :status="ledStatus" />
            <div class="console-display border-3d table" ref="consoleDisplay">
                <code class="table-row relative overflow-hidden" v-for="log in logs" :key="log.timestamp.getTime()">
                    <div
                        class="absolute font-digital select-none cursor-default pointer-events-none text-off/40 text-nowrap w-full opacity-30"
                    >
                        {{ "8".repeat(charPerLine) }}
                    </div>
                    <div>
                        <div class="table-cell" v-html="log.timestamp.toLocaleTimeString() + ' &nbsp;'"></div>
                        <div class="table-cell" :class="'text-' + log.type" v-html="log.type + ' &nbsp;'"></div>
                        <div class="table-cell text-nowrap overflow-hidden" v-html="formatLogClassColor(log.message)"></div>
                    </div>
                </code>
            </div>
        </div>
    </DeviceContainer>
</template>

<style scoped lang="scss">
.console-device {
    @apply mt-0;
    min-height: 100px;
    // max-height: 100px !important;
    max-height: 100px;

    .console-block {
        @apply flex w-11/12 lg:w-10/12 mx-auto overflow-hidden;
        // min-height: 70px;
        // max-height: 70px;
        // height: 70px;

        .console-display {
            @apply text-white bg-black p-1 grow shrink overflow-y-scroll border-2 ml-3;

            code {
                @apply opacity-80 hover:opacity-100 transition-opacity block font-digital;

                line-height: 1rem;
            }
        }
    }
}
</style>
