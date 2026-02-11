<script setup lang="ts">
import RackContainer from "@/components/rack/RackContainer.vue";
import { computed, reactive, ref } from "vue";
import { useRack } from "@/stores/useRack";
import ModalPanel from "@/components/modals/ModalPanel.vue";
import ConfirmDialog from "@/components/modals/ConfirmDialog.vue";
import SidebarStore from "@/components/devices/SidebarStore.vue";
import DeviceEditor from "@/components/editor/DeviceEditor.vue";
import AppConfig from "@/components/editor/AppConfig.vue";
import Outboard from "@/services/classes/Outboard";
import { SwipeDirection, useSwipe } from "@vueuse/core";
import { useWindowSize } from "@vueuse/core";

const { width } = useWindowSize();
const isDesktop = computed(() => width.value >= 1024);
const isTablet = computed(() => width.value >= 768 && width.value < 1024);
const isMobile = computed(() => !isDesktop.value && !isTablet.value);
const rackStore = useRack();
const showStore = ref<boolean>(false);
const modifiedDevice = ref<Outboard | undefined>();
const openSettings = ref<boolean>(false);
const openEditor = ref<boolean>(false);
const showCancelConfirm = ref(false);
const rackcontainerel = ref();
const { lengthX, direction } = useSwipe(rackcontainerel, {
    passive: false,
    // onSwipe() {
    // },
    onSwipeEnd() {
        if (Math.abs(lengthX.value) > 100) {
            if (direction.value === SwipeDirection.RIGHT) {
                showStore.value = true;
            } else if (direction.value === SwipeDirection.LEFT) {
                showStore.value = false;
            }
        }
    },
});

function cloneDevice(device: Outboard) {
    return new Outboard(JSON.parse(JSON.stringify(device))) as Outboard;
}

function toggleEditor(device?: Outboard, askConfirm = false) {
    if (device) {
        modifiedDevice.value = reactive(cloneDevice(device)) as Outboard;
    } else if (askConfirm) {
        showCancelConfirm.value = true;
        return;
    } else {
        modifiedDevice.value = undefined;
    }
    openEditor.value = device !== undefined;
}

function onCancelEditorYes() {
    showCancelConfirm.value = false;
    modifiedDevice.value = undefined;
    openEditor.value = false;
}

function onCancelEditorNo() {
    showCancelConfirm.value = false;
}

function saveAndCloseEditor() {
    if (!modifiedDevice.value) return;
    const source = modifiedDevice.value;
    const payload = source.toJSON();
    const device = new Outboard(payload);
    if (rackStore.rackDevice(device.id) ?? rackStore.storeDevice(device.id)) {
        rackStore.updateDevice(device);
    } else {
        rackStore.addDeviceToStore(device);
    }
    modifiedDevice.value = undefined;
    openEditor.value = false;
}

function copyConfiguration() {
    if (!modifiedDevice.value) return;

    window.navigator.clipboard.writeText(JSON.stringify(modifiedDevice.value.toJSON()));
}

function createDevice() {
    const newDevice = rackStore.createNewDevice();
    toggleEditor(newDevice);
}
</script>

<template>
    <main class="h-full flex overflow-x-hidden">
        <SidebarStore
            class="absolute left-0 top-0 h-full w-[85%] max-w-[20rem] md:relative md:max-w-1/2 lg:max-w-1/4 xl:max-w-1/5 transition-transform duration-300 ease-out md:transition-[width] md:duration-300 md:transform-none overflow-hidden"
            :class="[{ 'p-2': showStore, 'z-50': isMobile }, showStore ? 'translate-x-0 md:w-1/2 lg:w-1/4 xl:w-1/5' : '-translate-x-full md:w-0']"
            @openeditor="toggleEditor"
            @createdevice="createDevice"
            @closestore="showStore = false"
        />

        <!-- On mobile: overlay to close sidebar when clicking outside (pointer-events: none during drag so drops work) -->
        <div
            v-if="isMobile && showStore"
            class="sidebar-overlay fixed inset-0 z-40 bg-black/20 md:hidden"
            aria-hidden
            @click="showStore = false"
        />

        <RackContainer
            ref="rackcontainerel"
            class="w-full"
            @openeditor="toggleEditor"
            @togglestore="showStore = !showStore"
            @openstore="showStore = true"
            @togglesettings="openSettings = !openSettings"
            :isStoreOpened="showStore"
            :areSettingsOpened="openSettings"
        />

        <Teleport to="body">
            <ModalPanel
                v-if="modifiedDevice && openEditor"
                :show="!!(modifiedDevice && openEditor)"
                :confirm-close="true"
                confirm-close-message="Changes will be discarded. Do you want to continue?"
                @close="() => { modifiedDevice = undefined; openEditor = false; }"
            >
                <template v-slot:body>
                    <DeviceEditor :device="modifiedDevice" class="px-5" />
                </template>
                <template v-slot:footer>
                    <div class="flex flex-col md:flex-row grow gap-2">
                        <button
                            class="rounded border border-white/10 w-full p-2 shadow bg-white/10 hover:bg-white/20 text-white transition-colors"
                            @click="showCancelConfirm = true"
                        >
                            Cancel
                        </button>
                        <button
                            class="rounded border border-white/10 w-full p-2 shadow bg-white/10 hover:bg-white/20 text-white transition-colors"
                            @click="copyConfiguration()"
                        >
                            Copy configuration
                        </button>
                        <button
                            class="rounded border border-white/10 w-full p-2 shadow bg-white/10 hover:bg-white/20 text-white transition-colors"
                            @click="saveAndCloseEditor()"
                        >
                            Save
                        </button>
                    </div>
                </template>
            </ModalPanel>

            <ConfirmDialog
                v-if="showCancelConfirm"
                message="Do you want to cancel editing this device?"
                :yes-callback="onCancelEditorYes"
                :no-callback="onCancelEditorNo"
                @close="showCancelConfirm = false"
            />

            <ModalPanel v-if="openSettings" :show="openSettings" @close="() => (openSettings = false)">
                <template v-slot:body>
                    <AppConfig @forceclose="openSettings = false" />
                </template>
            </ModalPanel>
        </Teleport>
    </main>
</template>

<style scoped lang="scss"></style>
