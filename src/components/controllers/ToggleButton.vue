<script setup lang="ts">
import { ref } from "vue";
import LightLed from "./LightLed.vue";
import ControllerLabel from "./ControllerLabel.vue";

const emit = defineEmits<{
    (event: "changevalue", value: boolean): void;
}>();
defineProps<{ label?: string; invert?: boolean }>();
const active = ref<boolean>(false);

let changeTimeout: number | null = null;
let initialValue = active.value;
let newTimeoutValue = active.value;

function changeValue() {
    
    newTimeoutValue = active.value;
    
    active.value = !active.value;
    if (changeTimeout) clearTimeout(changeTimeout);
    changeTimeout = setTimeout(() => {
        if (initialValue === active.value) return;
        
        emit("changevalue", active.value);
        initialValue = active.value;
        changeTimeout = null;
    }, 250);
}
</script>

<template>
    <div class="btn flex-col cursor-pointer" :title="label" @click="changeValue">
        <LightLed class="cursor-pointer" :status="active ? 'on' : 'off'" />
        <ControllerLabel v-if="label" :label="label" :invert="invert" />
    </div>
</template>

<style scoped land="scss"></style>
