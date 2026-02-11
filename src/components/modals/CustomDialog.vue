<script setup lang="ts">
// import { useApp } from "@/stores/useApp";
import ModalPanel from "./ModalPanel.vue";
import IconClose from "@/components/icons/CancelIcon.vue";

export interface IDialogButton {
    label: string;
    callback: CallableFunction;
    class?: string;
}

const emit = defineEmits(["close"]);

defineProps<{
    message: string;
    buttons: IDialogButton[];
    close?: CallableFunction;
}>();

function handleClick(callback?: CallableFunction) {
    if (callback) callback();
    emit("close");
}
</script>

<template>
    <Teleport to="body">
        <ModalPanel :show="true" :style="'z-index: 9999;'">
            <template #header v-if="close">
                <div class="flex w-full">
                    <div class="grow">
                        <button type="button" @click="handleClick(close)" class="mt-1">
                            <IconClose class="text-2xl mr-1 p-1" />
                        </button>
                    </div>
                </div>
            </template>
            <template #body>
                <div class="border-b px-2 pb-4 text-white" style="white-space: pre-line" v-html="message"></div>
            </template>
            <template #footer>
                <div class="gap-2 flex w-full">
                    <button
                        v-for="(button, index) in buttons"
                        :key="index"
                        @click="handleClick(button.callback)"
                        class="rounded border border-white/10 w-full p-2 shadow bg-white/10 hover:bg-white/20 text-white transition-colors"
                        :class="[button.class || 'btn-primary']"
                        type="button"
                    >
                        {{ button.label }}
                    </button>
                </div>
            </template>
        </ModalPanel>
    </Teleport>
</template>

<script></script>
