<script lang="ts" setup>
import { useColors } from "@/composables/useColors";
import { ref, computed, watch } from "vue";
import CollapseButton from "@/components/controllers/CollapseButton.vue";
import ScrewIcon from "@/components/controllers/ScrewIcon.vue";
import DragIcon from "@/components/icons/DragIcon.vue";
import type Color from "@/services/classes/Color";

const emit = defineEmits(["togglecollapse"]);
const props = withDefaults(
    defineProps<{
        background: Color;
        collapsable: boolean;
        collapsed: boolean;
        draggable?: boolean;
        selected?: boolean;
        display?: "vertical" | "horizontal";
        label?: string;
    }>(),
    {
        display: "vertical",
        draggable: false,
        selected: false,
    }
);

const { background, isFgInverted } = useColors(props.background);
const currentlyCollapsed = ref<boolean>(props.collapsed);
/** When "collapse all" is active, true means this device was individually expanded by the user. */
const individuallyExpanded = ref<boolean>(false);
const invert = ref<boolean>(isFgInverted);

const effectiveCollapsed = computed(() =>
    props.collapsed ? !individuallyExpanded.value : currentlyCollapsed.value
);

watch(
    () => props.collapsed,
    (v) => {
        if (v) currentlyCollapsed.value = true;
        else {
            currentlyCollapsed.value = false;
            individuallyExpanded.value = false;
        }
    }
);

function toggleCollapsed() {
    if (!props.collapsable) return;
    if (props.collapsed) {
        individuallyExpanded.value = !individuallyExpanded.value;
    } else {
        currentlyCollapsed.value = !currentlyCollapsed.value;
    }
    emit("togglecollapse");
}
</script>

<template>
    <!-- DEVICE -->
    <div
        class="device"
        :class="{ collapsed: effectiveCollapsed }"
        :style="{ 'background-color': background.toString(), 'box-shadow': selected ? '0px 10px 18px 4px' : '0px 1px 4px' }"
    >
        <Transition name="device-expand">
            <div
                v-if="!effectiveCollapsed"
                class="px-2 flex flex-col items-center justify-between"
            >
                <ScrewIcon />
                <div class="overflow-hidden" v-if="draggable" :class="[{ invert }, 'column-drag-handle']">
                    <DragIcon />
                    <DragIcon />
                </div>
                <ScrewIcon />
            </div>
        </Transition>
        <div class="flex grow relative px-2" :class="display === 'vertical' ? 'flex-col' : 'flex-row'">
            <div class="flex justify-between relative items-center gap-2 min-h-0">
                <CollapseButton
                    class="items-start shrink-0"
                    v-if="collapsable"
                    :collapsed="effectiveCollapsed"
                    :invert="invert"
                    @togglecollapse="toggleCollapsed"
                    title="Toggle collapse"
                />
                <!-- when expanded: custom headers -->
                <Transition name="device-expand" mode="out-in">
                    <div v-if="!effectiveCollapsed" key="header" class="flex grow min-w-0 justify-end">
                        <slot name="header"></slot>
                    </div>
                    <div v-else key="preview" class="flex items-center justify-center grow min-w-0 py-0.5">
                        <slot name="collapsedPreview"></slot>
                    </div>
                </Transition>
            </div>
            <Transition name="device-expand" class="device-expand-content">
                <div v-if="!effectiveCollapsed" class="flex grow relative h-full mx-auto w-full lg:w-11/12">
                    <!-- device controllers -->
                    <slot></slot>
                </div>
            </Transition>
        </div>
        <Transition name="device-expand">
            <div
                v-if="!effectiveCollapsed"
                class="px-2 flex flex-col items-center justify-between"
            >
                <ScrewIcon />
                <div class="overflow-hidden" v-if="draggable" :class="[{ invert }, 'column-drag-handle']">
                    <DragIcon />
                    <DragIcon />
                </div>
                <ScrewIcon />
            </div>
        </Transition>
    </div>
</template>

<style scoped lang="scss">
$expand-duration: 0.25s;

.device {
    @apply rounded-sm my-1 mx-0.5 py-2 overflow-hidden select-none flex;
    background-image: url(/metal.jpg);
    background-blend-mode: soft-light;
    min-height: 80px;
    transition: min-height $expand-duration ease-out;

    &:not(.collapsed) {
        min-height: 151px;
    }

    &:not(.collapsed):hover label {
        @apply opacity-10;
    }

    &.collapsed {
        @apply items-center;
    }
}

/* Expand/collapse content fade – same duration as min-height */
.device-expand-enter-active,
.device-expand-leave-active {
    transition: opacity $expand-duration ease-out;
}
.device-expand-enter-from,
.device-expand-leave-to {
    opacity: 0;
}
/* Take main content out of flow when leaving so container height can shrink during collapse */
.device-expand-content.device-expand-leave-active {
    position: absolute;
    left: 0;
    right: 0;
}
</style>
