<script lang="ts" setup>
import ToolBar from "@/components/toolbar/ToolBar.vue";
import { useRack } from "@/stores/useRack";
import OutboardsContainer from "@/components/rack/OutboardsContainer.vue";
import ConsoleDevice from "@/components/devices/ConsoleDevice.vue";
import OutboardDevice from "@/components/devices/OutboardDevice.vue";
import type Midi from "@/services/classes/Midi";
import { Container, Draggable } from "vue-dndrop";
import type RackConsole from "@/services/classes/RackConsole";
import type Outboard from "@/services/classes/Outboard";
import { useWindowSize } from "@vueuse/core";
import type { DropResult, DragResult } from "@/services/types/devices";
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

const emit = defineEmits<{
    (event: "openeditor", device: Outboard): void;
    (event: "togglestore"): void;
    (event: "togglesettings"): void;
    (event: "openstore"): void;
}>();

defineProps<{
    isStoreOpened: boolean;
    areSettingsOpened: boolean;
}>();

const rackStore = useRack();

const collapseAll = ref<boolean>(false);
const selectedDevice = ref<Outboard | undefined>();
const showConsole = ref<boolean>(false);

const { width } = useWindowSize();
const isDesktop = computed(() => width.value >= 1024);
const isMobile = computed(() => !isDesktop.value);

/** When dragging from rack: open left sidebar when pointer is over at least half of the sidebar width (so user doesn't have to drag off screen). */
function getLeftSidebarOpenThreshold(): number {
    const sidebar_max_width_px = 320; // 20rem
    const sidebar_width = Math.min(window.innerWidth * 0.85, sidebar_max_width_px);
    return sidebar_width * 0.5;
}

let pointerMoveHandler: ((e: PointerEvent | TouchEvent) => void) | null = null;

function getGhostParent() {
    return document.body;
}

function onDragStartFromRack(dragResult: DragResult) {
    document.body.classList.add("is-dragging");
    if (!dragResult.isSource || (dragResult.payload as { list?: string })?.list !== "rack") return;
    pointerMoveHandler = (e: PointerEvent | TouchEvent) => {
        const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
        if (clientX === undefined) return;
        const threshold = getLeftSidebarOpenThreshold();
        if (isMobile.value && clientX < threshold) emit("openstore");
        // When pointer is over left (sidebar) area, show ghost as preview-style (CSS class on body)
        document.body.classList.toggle("dragging-over-sidebar", clientX < threshold);
    };
    document.addEventListener("pointermove", pointerMoveHandler as (e: PointerEvent) => void);
    document.addEventListener("touchmove", pointerMoveHandler as (e: TouchEvent) => void, { passive: true });
}

function onDragEndFromRack() {
    document.body.classList.remove("dragging-over-sidebar");
    if (pointerMoveHandler) {
        document.removeEventListener("pointermove", pointerMoveHandler as (e: PointerEvent) => void);
        document.removeEventListener("touchmove", pointerMoveHandler as (e: TouchEvent) => void);
        pointerMoveHandler = null;
    }
}

onUnmounted(() => {
    document.body.classList.remove("dragging-over-sidebar", "is-dragging");
    if (pointerMoveHandler) {
        document.removeEventListener("pointermove", pointerMoveHandler as (e: PointerEvent) => void);
        document.removeEventListener("touchmove", pointerMoveHandler as (e: TouchEvent) => void);
    }
});

function selectFirstDevice() {
    selectedDevice.value = rackStore.rackDevices.length ? (rackStore.rackDevices[0] as Outboard) : undefined;
}

function toggleCollapseAll(collapse: boolean) {
    collapseAll.value = collapse;
}

function onDrop(dropResult: DropResult) {
    if (dropResult.removedIndex === null && dropResult.addedIndex !== null) {
        rackStore.moveDeviceToRack(dropResult.payload.device, dropResult.addedIndex);
        selectedDevice.value = dropResult.payload.device;
    } else if (dropResult.removedIndex !== null && dropResult.addedIndex !== null && dropResult.payload.list === "rack") {
        rackStore.reorderRackDevices(dropResult.payload.device, dropResult.removedIndex, dropResult.addedIndex);
    }
}

function focusDevice(device: Outboard) {
    if (selectedDevice.value !== device) selectedDevice.value = device;
}

function moveBackToStore(device: Outboard) {
    rackStore.moveDeviceBackToStore(device);
    selectFirstDevice();
}

watch(
    () => selectedDevice.value,
    () => {
        if (selectedDevice.value) document.title = "App - " + selectedDevice.value.label;
    }
);

onMounted(() => {
    selectFirstDevice();
});
</script>

<template>
    <div class="h-full flex flex-col">
        <!-- header row -->
        <div class="table w-full flex-none rack-table-row-header">
            <div class="table-row">
                <div class="hidden md:table-cell cell lt"></div>
                <div class="table-cell cell ct">
                    <ToolBar
                        class="mx-2 my-3"
                        :showToggleConsole="isDesktop"
                        @toggleconsole="showConsole = !showConsole"
                        @togglestore="$emit('togglestore')"
                        @togglecollapseall="toggleCollapseAll"
                        @togglesettings="$emit('togglesettings')"
                        :isStoreOpened="isStoreOpened"
                        :areSettingsOpened="areSettingsOpened"
                        :isConsoleOpened="showConsole"
                    />
                </div>
                <div class="hidden md:table-cell cell rt"></div>
            </div>
        </div>

        <!-- content row: flex-1 gives it a defined height so dndrop-container can fill it -->
        <div class="flex-1 min-h-0 overflow-y-hidden">
            <div class="table rack-table-content w-full h-full">
                <div class="table-row">
                    <div class="hidden md:table-cell cell lc"></div>
                    <div class="table-cell cell cc">
                        <div class="h-full min-h-0 flex flex-col">
                            <OutboardsContainer class="flex-1 min-h-0" :showConsole="showConsole">
                                <Container
                                    class="min-h-0 flex flex-col"
                                    :get-child-payload="(index: number) => ({ list: 'rack', device: rackStore.rackDevices[index] })"
                                    :get-ghost-parent="getGhostParent"
                                    :fire-related-events-only="true"
                                    drag-handle-selector=".column-drag-handle"
                                    drag-class="dndrop-dragging-ghost"
                                    group-name="devices"
                                    data-index="rack"
                                    orientation="vertical"
                                    @drop="(drop: DropResult) => onDrop(drop)"
                                    @drag-start="onDragStartFromRack"
                                    @drag-end="onDragEndFromRack"
                                    v-if="rackStore.midi !== undefined || rackStore.http !== undefined"
                                >
                                    <Draggable v-for="device in rackStore.rackDevices" :key="(device as Outboard).key">
                                        <OutboardDevice
                                            :background="device.backgroundColor"
                                            :collapsable="true"
                                            :draggable="true"
                                            :collapsed="collapseAll"
                                            :selected="selectedDevice !== undefined && selectedDevice.id === device.id"
                                            :device="(device as Outboard)"
                                            :midi="(rackStore.midi as Midi)"
                                            :is-selected="selectedDevice !== undefined && selectedDevice.id === device.id"
                                            @openeditor="() => $emit('openeditor', device as Outboard)"
                                            @removedevice="() => moveBackToStore(device as Outboard)"
                                            @click="focusDevice(device as Outboard)"
                                        />
                                    </Draggable>
                                </Container>

                                <template v-slot:footer v-if="rackStore.console && isDesktop">
                                    <ConsoleDevice
                                        v-show="showConsole && rackStore.console"
                                        :console="(rackStore.console as RackConsole)"
                                        :collapsable="true"
                                        :collapsed="collapseAll"
                                    />
                                </template>
                            </OutboardsContainer>
                        </div>
                    </div>
                    <div class="hidden md:table-cell cell rc"></div>
                </div>
            </div>
        </div>

        <!-- footer row -->
        <div class="table w-full flex-none rack-table-row-footer">
            <div class="table-row">
                <div class="hidden md:table-cell cell lb"></div>
                <div class="table-cell cell cb"></div>
                <div class="hidden md:table-cell cell rb"></div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.rack-table-row-header,
.rack-table-row-footer {
    height: 61px;

    .table-row .cell {
        height: 61px;
    }
}

.rack-table-content {
    .cell:first-child,
    .cell:last-child {
        background-repeat: repeat-y;
    }
}

:deep(.table-row) {
    .cell {
        &:first-child,
        &:last-child {
            width: 53px;
        }

        &:nth-child(2) {
            background-repeat: repeat-x;
        }

        &.lt {
            background-image: url(/box-top-left.jpg);
        }
        &.ct {
            background-image: url(/box-top-center.jpg);
        }
        &.rt {
            background-image: url(/box-top-right.jpg);
        }
        &.lc {
            background-image: url(/box-center-left.jpg);
        }
        &.rc {
            background-image: url(/box-center-right.jpg);
        }
        &.lb {
            background-image: url(/box-bottom-left.jpg);
        }
        &.cb {
            background-image: url(/box-bottom-center.jpg);
            background-position-y: bottom;
        }
        &.rb {
            background-image: url(/box-bottom-right.jpg);
        }
    }
}
</style>
