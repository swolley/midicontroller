<script lang="ts" setup></script>

<template>
    <div class="rack relative flex flex-col">
        <div class="rack-side left"></div>
        <div class="rack-side right"></div>
        <!-- preamps: flex-1 min-h-0 + overflow-y-auto so the list scrolls when devices don't fit -->
        <div class="rack-devices flex-1 min-h-0 flex flex-col overflow-y-auto">
            <slot></slot>
        </div>
        <!-- footer -->
        <div class="relative z-10">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<style scoped lang="scss">
.rack {
    margin: -6px 0px 0px 3px;
    height: calc(100% + 12px);

    .rack-side {
        @apply absolute h-full top-0 bottom-0 z-0;
        width: 50px;
        background-repeat: repeat-y;

        &.left {
            @apply left-0;
            background-image: url(/interno_sx.gif);
        }
        &.right {
            @apply right-0;
            background-image: url(/interno_dx.gif);
        }
    }

    .rack-devices {
        @apply z-10 relative;
        overflow-y: auto;
    }
    // .rack .rack-devices:has(+ .preamp-display:not(.full)) {
    //     height: calc(100% - 66px);
    // }
}
</style>
