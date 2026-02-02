<script setup lang="ts">
import AngleDownIcon from "../icons/AngleDownIcon.vue";
import AngleUpIcon from "../icons/AngleUpIcon.vue";

defineProps<{ collapsed: boolean; invert: boolean }>();
</script>

<template>
    <div :class="{ invert: invert }">
        <button v-if="!collapsed" class="btn h-6 aspect-square" @click="$emit('togglecollapse')" @touchend="$emit('togglecollapse')">
            <AngleUpIcon />
        </button>
        <button v-else class="btn h-6 aspect-square" @click="$emit('togglecollapse')" @touchend="$emit('togglecollapse')">
            <AngleDownIcon />
        </button>
    </div>
</template>

<style scoped lang="scss"></style>
