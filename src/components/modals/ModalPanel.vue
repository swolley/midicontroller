<script setup lang="ts">
import { onMounted, ref } from "vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const props = withDefaults(
    defineProps<{ show: boolean; confirmClose?: boolean; confirmCloseMessage?: string; style?: string }>(),
    { confirmCloseMessage: "Changes will be discarded. Do you want to continue?" }
);

const emit = defineEmits(["close"]);

const showConfirmDialog = ref(false);

onMounted(() => {
    document.addEventListener("keyup", handleClose);
});

function handleClose(e: Event) {
    if (e.type !== "click" && e.type === "keyup" && (e as KeyboardEvent).key !== "Escape") return;
    if (props.confirmClose) {
        showConfirmDialog.value = true;
        return;
    }
    emit("close");
    document.removeEventListener("keyup", handleClose);
}

function onConfirmYes() {
    showConfirmDialog.value = false;
    document.removeEventListener("keyup", handleClose);
    emit("close");
}

function onConfirmNo() {
    showConfirmDialog.value = false;
}
</script>
<template>
    <Transition name="modal" :duration="350">
        <div v-if="show" class="modal-mask">
            <Transition name="modal-slide" appear>
                <div class="modal-wrapper backdrop-blur-sm" v-bind:style="style" @click="handleClose">
                    <div
                        class="modal-content mx-auto p-4 bg-gray-900/75 border-2 border-white/30 rounded shadow-lg overflow-hidden max-h-screen w-full md:max-w-4xl"
                        @click.stop
                    >
                    <div class="modal-header">
                        <slot name="header"></slot>
                    </div>

                    <div class="modal-body my-4 overflow-y-auto pr-1">
                        <slot name="body"></slot>
                    </div>

                    <div class="modal-footer flex items-center justify-center mx-auto">
                        <slot name="footer">
                            <button
                                class="rounded border border-white/10 w-full p-2 shadow bg-white/10 hover:bg-white/20 text-white transition-colors"
                                @click="handleClose"
                            >
                                Ok
                            </button>
                        </slot>
                    </div>
                </div>
                </div>
            </Transition>
        </div>
    </Transition>

    <Teleport to="body">
        <ConfirmDialog
            v-if="showConfirmDialog"
            :message="confirmCloseMessage"
            :yes-callback="onConfirmYes"
            :no-callback="onConfirmNo"
            :cancel-callback="onConfirmNo"
            @close="showConfirmDialog = false"
        />
    </Teleport>
</template>

<style scoped>
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: table;
    transition: opacity 0.3s ease;
}

.modal-wrapper {
    display: table-cell;
    vertical-align: middle;
    padding: 1rem;
    transition: transform 0.15s ease-out;
}

/* Outer transition: mask opacity */
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

/* Inner transition (appear): slide in - mobile = from bottom */
.modal-slide-enter-from {
    transform: translateY(100%);
}

.modal-slide-enter-active {
    transition: transform 0.15s ease-out;
}

.modal-slide-enter-to {
    transform: translateY(0);
}

/* Leave: slide out (outer transition) - mobile = to bottom */
.modal-leave-active .modal-wrapper {
    transition: transform 0.15s ease-out;
}

.modal-leave-to .modal-wrapper {
    transform: translateY(100%) !important;
}

.modal-body.overflow-y-auto {
    max-height: calc(100vh - 300px);
}
</style>
