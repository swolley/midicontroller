<script setup lang="ts">
import RackContainer from "@/components/rack/RackContainer.vue";
import { ref } from "vue";
import { useRack } from "@/stores/useRack";
import ModalPanel from "@/components/modals/ModalPanel.vue";
import SidebarStore from "@/components/devices/SidebarStore.vue";
import DeviceEditor from "@/components/editor/DeviceEditor.vue";
import AppConfig from "@/components/editor/AppConfig.vue";
import { Outboard } from "@/services/classes/Outboard";
import { SwipeDirection, useSwipe } from "@vueuse/core";

const rackStore = useRack();
const showStore = ref<boolean>(rackStore.rackDevices.length === 0);
const modifiedDevice = ref<Outboard | undefined>();
const openSettings = ref<boolean>(false);
const openEditor = ref<boolean>(false);
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
        modifiedDevice.value = cloneDevice(device);
    } else if (askConfirm && confirm("Do you want to cancel this device edting?")) {
        modifiedDevice.value = undefined;
    }
    openEditor.value = device !== undefined;
}

function saveAndCloseEditor() {
    if (modifiedDevice.value) {
        modifiedDevice.value = undefined;
        openEditor.value = false;
    }
}

function createDevice() {
    const newDevice = rackStore.createNewDevice();
    toggleEditor(newDevice);
}
</script>

<template>
    <main class="h-full flex">
        <SidebarStore
            class="absolute md:static z-50 max-w-1/2 lg:max-w-1/4 xl:max-w-1/5"
            :class="[{ 'p-2': showStore }, showStore ? 'w-1/2 lg:w-1/4 xl:w-1/5' : 'w-0']"
            @openeditor="toggleEditor"
            @createdevice="createDevice"
            @closestore="showStore = false"
        />

        <RackContainer
            ref="rackcontainerel"
            class="w-full"
            @openeditor="toggleEditor"
            @togglestore="showStore = !showStore"
            @togglesettings="openSettings = !openSettings"
        />

        <Teleport to="body">
            <ModalPanel v-if="modifiedDevice && openEditor" :show="modifiedDevice && openEditor">
                <template v-slot:body>
                    <DeviceEditor :device="modifiedDevice" class="px-5" />
                </template>
                <template v-slot:footer>
                    <div class="flex flex-col md:flex-row grow gap-2">
                        <button
                            class="rounded border border-white/10 w-full p-2 shadow bg-white/10 hover:bg-white/20 text-white transition-colors"
                            @click="toggleEditor(undefined, true)"
                        >
                            Cancel
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

            <ModalPanel v-if="openSettings" :show="openSettings" @close="() => (openSettings = false)">
                <template v-slot:body>
                    <AppConfig @forceclose="openSettings = false" />
                </template>
            </ModalPanel>
        </Teleport>
    </main>
</template>

<style scoped lang="scss"></style>
