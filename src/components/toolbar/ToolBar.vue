<script lang="ts" setup>
import AngleDownIcon from "@/components/icons/AngleDownIcon.vue";
import AngleUpIcon from "@/components/icons/AngleUpIcon.vue";
import ConsoleIcon from "@/components/icons/ConsoleIcon.vue";
import BookIcon from "@/components/icons/BookIcon.vue";
import SlidersIcon from "@/components/icons/SlidersIcon.vue";

const emit = defineEmits(["togglecollapseall", "openeditor", "toggleconsole", "togglestore", "togglesettings"]);

defineProps<{
    showToggleConsole: boolean;
}>();

function toggleCollapseAll(collapse: boolean) {
    emit("togglecollapseall", collapse);
}
</script>

<template>
    <nav class="flex justify-between gap-2">
        <div class="flex gap-2">
            <button class="btn btn-outline h-8 xl:h-7 aspect-square invert" title="Open Settings" @click="$emit('togglestore')">
                <BookIcon />
            </button>
            <button class="btn btn-outline h-8 xl:h-7 aspect-square invert" title="Open Settings" @click="$emit('togglesettings')">
                <SlidersIcon />
            </button>
        </div>
        <div class="flex gap-2">
            <button class="btn btn-outline h-8 xl:h-7 aspect-square invert" title="Collapse all" @click="() => toggleCollapseAll(true)">
                <AngleUpIcon />
            </button>
            <button class="btn btn-outline h-8 xl:h-7 aspect-square invert" title="Expand all" @click="() => toggleCollapseAll(false)">
                <AngleDownIcon />
            </button>
            <button v-show="showToggleConsole" class="btn btn-outline h-8 xl:h-7 aspect-square invert" title="Toggle Console" @click="$emit('toggleconsole')">
                <ConsoleIcon />
            </button>
        </div>
    </nav>
</template>

<style scoped lang="scss"></style>
