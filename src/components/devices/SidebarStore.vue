<script lang="ts">
type SidebarDevices = Record<string, { opened: boolean; devices: Outboard[] }>;
</script>

<script setup lang="ts">
import type { DropResult } from "@/services/types/devices";
import OutboardPreview from "@/components/devices/OutboardPreview.vue";
import { Container, Draggable } from "vue-dndrop";
import TrashIcon from "../icons/TrashIcon.vue";
import PlusIcon from "../icons/PlusIcon.vue";
import PaletteIcon from "../icons/PaletteIcon.vue";
import { useRack } from "@/stores/useRack";
import { ref } from "vue";
import type Outboard from "@/services/classes/Outboard";
import ConfirmDialog from "@/components/modals/ConfirmDialog.vue";
import AngleDownIcon from "../icons/AngleDownIcon.vue";
import AngleUpIcon from "../icons/AngleUpIcon.vue";
import { StringUtils } from "@/services/classes/Utils";
import type { CategorizedDeviceList } from "@/services/types/stores";

defineEmits<{
    (event: "createdevice"): void;
    (event: "openeditor", device: Outboard): void;
}>();

const rackStore = useRack();
rackStore.init();

const currentRemoveDeviceCb = ref<CallableFunction | null>(null);

const remapped: SidebarDevices = {};
for (const group in rackStore.availableDevices) {
    remapped[group] = { opened: false, devices: rackStore.availableDevices[group] };
}
const keys = Object.keys(remapped);
if (keys.length === 1) remapped[keys[0]].opened = true;

const groupedDevices = ref<SidebarDevices>(remapped);

function getGhostParent() {
    return document.body;
}

function onDragStart() {
    document.body.classList.add("is-dragging");
}

function onDragEnd() {
    document.body.classList.remove("is-dragging");
}

function onDrop(dropResult: DropResult, toList: keyof CategorizedDeviceList) {
    if (dropResult.payload.list === "rack") {
        // Dragging from rack (right) to store category (left): place device in this container
        rackStore.moveDeviceToCategory(dropResult.payload.device, toList, dropResult.addedIndex, "rack");
    } else if (dropResult.payload.list !== "rack" && toList !== dropResult.payload.device.category) {
        rackStore.moveDeviceToCategory(dropResult.payload.device, toList, dropResult.addedIndex);
    } else if (dropResult.removedIndex !== undefined && dropResult.addedIndex !== undefined) {
        rackStore.reorderCategoryDevices(dropResult.payload.device, dropResult.removedIndex, dropResult.addedIndex);
    }
}

function removeDevice(device: Outboard) {
    rackStore.removeDevice(device);
}

function askRemoveDevice(device: Outboard) {
    currentRemoveDeviceCb.value = () => removeDevice(device);
}
</script>

<template>
    <div class="sidebar">
        <div class="relative h-full">
            <button
                class="rounded border-2 border-dashed flex w-full items-center justify-center p-5 m-1 mb-3 opacity-30 hover:opacity-70 transition-opacity cursor-pointer"
                @click="$emit('createdevice')"
            >
                <PlusIcon class="text-gray-100 text-xl" />
            </button>
            <div v-for="(group, name) in (groupedDevices as SidebarDevices)" :key="name">
                <button class="flex w-full text-gray-500 items-center px-1 cursor-pointer" @click="group.opened = !group.opened">
                    <div class="grow select-none text-left">{{ StringUtils.ucFirst(name) }} ({{ groupedDevices[name].devices.length }})</div>
                    <AngleDownIcon v-if="group.opened" />
                    <AngleUpIcon v-else />
                </button>
                <Container
                    v-show="group.opened"
                    class="grow relative"
                    group-name="devices"
                    orientation="vertical"
                    drag-class="dndrop-dragging-ghost"
                    :get-ghost-parent="getGhostParent"
                    :data-group="name"
                    :get-child-payload="(index: number) => ({ list: name, device: group.devices[index] })"
                    @drop="(drop: DropResult) => onDrop(drop, name)"
                    @drag-start="onDragStart"
                    @drag-end="onDragEnd"
                >
                    <template v-for="device in groupedDevices[name].devices" :key="device.id">
                        <Draggable class="relative last:mb-2 draggable-item">
                            <OutboardPreview
                                class="cursor-pointer active:cursor-move opacity-95 hover:opacity-100 transition-opacity border border-gray-500"
                                :showPots="true"
                                :device="(device as Outboard)"
                            />
                            <template v-if="!device.stock">
                                <PaletteIcon
                                    class="rounded-full border absolute top-1 right-7 text-white p-1 text-2xl bg-black/50 opacity-50 hover:opacity-100 transition-opacity cursor-pointer shadow hover:shadow-lg"
                                    @click="$emit('openeditor', device)"
                                />
                                <TrashIcon
                                    class="rounded-full border absolute top-1 right-0 text-white p-1 text-2xl bg-black/50 opacity-50 hover:opacity-100 transition-opacity cursor-pointer shadow hover:shadow-lg"
                                    @click="askRemoveDevice(device as Outboard)"
                                />
                            </template>
                        </Draggable>
                    </template>
                </Container>
            </div>

            <!-- <button
                class="rounded border border-white/10 w-full p-2 shadow bg-white/10 hover:bg-white/20 text-white transition-colors absolute bottom-0"
                @click="$emit('showstore')"
            >
                Close Store
            </button> -->
        </div>

        <Teleport to="body">
            <ConfirmDialog
                v-if="currentRemoveDeviceCb !== null"
                message="Would you like to delete the selected device?"
                :yes-callback="currentRemoveDeviceCb"
                :no-callback="() => (currentRemoveDeviceCb = null)"
                @close="currentRemoveDeviceCb = null"
            />
        </Teleport>
    </div>
</template>

<style scoped scss>
.sidebar {
    @apply overflow-y-auto shadow-lg h-full border border-black transition-all flex flex-col bg-black;
}
</style>
