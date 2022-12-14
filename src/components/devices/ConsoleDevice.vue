<script lang="ts" setup>
import DeviceContainer from "./DeviceContainer.vue";
import type { LedStatus, IConsoleLog } from "@/services/types/devices";
import { ref, watch } from "vue";
import LightLed from "../controllers/LightLed.vue";
import type RackConsole from "@/services/classes/RackConsole";

const props = defineProps<{
    collapsable: boolean;
    collapsed: boolean;
    console: RackConsole;
}>();

const logs = ref<IConsoleLog[]>(props.console.logs);
const ledStatus = ref<LedStatus>("off");
let blinkTimeout: number | null = null;
const currentlyCollapsed = ref<boolean>(props.collapsed);

watch(logs, (value: IConsoleLog[]) => {
    if (!value.length) return;
    if (blinkTimeout) clearTimeout(blinkTimeout);
    ledStatus.value = value[value.length - 1].type;
    blinkTimeout = setTimeout(() => (ledStatus.value = "off"), 100);
});
</script>

<template>
    <DeviceContainer
        class="console-device"
        :class="{ full: !currentlyCollapsed }"
        background="#050505"
        :collapsable="collapsable"
        :collapsed="currentlyCollapsed"
        display="horizontal"
        @togglecollapse="currentlyCollapsed = !currentlyCollapsed"
    >
        <div class="console-block">
            <LightLed class="mt-2" :status="ledStatus" />
            <div class="console-display border-3d table">
                <code class="table-row" v-for="log in console.logs" :key="log.timestamp.getTime()">
                    <div class="table-cell">{{ log.timestamp.toLocaleTimeString() }}</div>
                    <div class="table-cell text-center px-2" :class="'text-' + log.type">
                        {{ log.type.toUpperCase() }}
                    </div>
                    <div class="table-cell">{{ log.message }}</div>
                </code>
            </div>
        </div>
    </DeviceContainer>
</template>

<style scoped lang="scss">
.console-device {
    @apply mt-0;
    // min-height: 40px !important;
    max-height: 80px !important;

    .console-block {
        @apply flex w-11/12 lg:w-10/12 mx-auto overflow-hidden;
        // min-height: 70px;
        // max-height: 70px;
        // height: 70px;

        .console-display {
            @apply text-white bg-black p-1 grow shrink overflow-y-scroll border-2 ml-3;

            code {
                @apply opacity-80 hover:opacity-100 block font-digital;

                line-height: 1rem;
            }
        }
    }
}
</style>
