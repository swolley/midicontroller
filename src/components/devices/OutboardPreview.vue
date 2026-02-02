<script setup lang="ts">
import { useColors } from "@/composables/useColors";
import { computed, ref } from "vue";
import RotaryIcon from "@/components/icons/RotaryIcon.vue";
import type Outboard from "@/services/classes/Outboard";

const props = defineProps<{
    device: Outboard;
    showPots: boolean;
}>();

const { background, isFgInverted } = useColors(props.device.backgroundColor);
const invert = ref<boolean>(isFgInverted);
const potStyles = computed(() => props.device.style || "dark");
</script>

<template>
    <div class="device" :style="{ 'background-color': background.toString() }">
        <div class="opacity-50 whitespace-nowrap text-center truncate" :class="{ invert: invert }">
            {{ device.label || device.id }}
        </div>
        <div class="flex justify-end gap-2 px-3" v-if="showPots">
            <RotaryIcon :pot-style="potStyles" />
            <RotaryIcon :pot-style="potStyles" />
            <RotaryIcon :pot-style="potStyles" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.device {
    box-shadow: 0px 1px 2px;
    background-image: url(/metal.jpg);
    background-blend-mode: soft-light;
    @apply flex flex-col gap-2 rounded-sm my-1.5 mx-0.5 py-2 px-1 overflow-hidden select-none relative;
}
</style>
