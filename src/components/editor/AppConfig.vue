<script setup lang="ts">
import { useRack } from "@/stores/useRack";
import PlusIconVue from "@/components/icons/PlusIcon.vue";
import TrashIcon from "@/components/icons/TrashIcon.vue";

const emit = defineEmits(["forceclose"]);

const rackStore = useRack();

function toggleActiveMidi(id: string) {
    if (!rackStore.midi) return;

    if (rackStore.midi.isActive(id)) {
        rackStore.midi.disable(id);
    } else {
        rackStore.midi.enable(id);
    }
}

function toggleActiveHttp(id: string) {
    if (!rackStore.http) return;

    if (rackStore.http.isActive(id)) {
        rackStore.http.disable(id);
    } else {
        rackStore.http.enable(id);
    }
}

async function handleResetAll() {
    if (!confirm("Would you like to reset all settings?")) return;
    await rackStore.reset();
    emit("forceclose");
}
</script>

<template>
    <div>
        <div class="flex flex-col md:flex-row gap-4">
            <div v-if="rackStore.midi" class="text-white flex-1">
                <div class="text-white/20 border-b border-white/5 mb-2">Audio Interfaces</div>
                <div
                    v-for="output in rackStore.midi.outputs"
                    :key="output.id"
                    class="field form-input mb-1 cursor-pointer"
                    @click="() => toggleActiveMidi(output.id)"
                >
                    <input
                        type="checkbox"
                        :name="output.id"
                        :value="output.id"
                        :checked="rackStore.midi.isActive(output.id)"
                        @click.prevent.stop="() => toggleActiveMidi(output.id)"
                    />
                    <label :for="output.id" class="ml-2 form-label select-none">{{
                        (output.manufacturer ? output.manufacturer + " - " : "") + output.name
                    }}</label>
                </div>
            </div>
            <div v-if="rackStore.http" class="text-white flex-1">
                <div class="text-white/20 border-b border-white/5 mb-2">Http Hosts</div>
                <div v-for="output in rackStore.http.outputs" :key="output.id" class="field flex gap-2 mb-1">
                    <div class="form-input cursor-pointer">
                        <input
                            type="checkbox"
                            :value="output.id"
                            :checked="rackStore.http.isActive(output.id)"
                            @change="() => toggleActiveHttp(output.id)"
                            @click.prevent.stop="() => toggleActiveHttp(output.id)"
                        />
                        <label class="ml-2 form-label select-none">{{ /*output.host*/ output.id }}</label>
                    </div>
                    <button class="btn btn-outline invert opacity-40 text-white">
                        <TrashIcon class="w-8" />
                    </button>
                </div>
                <div class="field flex gap-2">
                    <input type="text" class="form-input" placeholder="Create new Host" />
                    <button class="btn btn-outline invert opacity-40 text-white">
                        <PlusIconVue class="w-8" />
                    </button>
                </div>
            </div>
        </div>
        <button
            class="rounded border border-red-500/10 w-full mt-2 p-2 shadow bg-red-500/5 hover:bg-red-500/20 text-red-500/70 hover:text-red-500 transition-colors"
            @click="handleResetAll"
        >
            Reset all settings
        </button>
    </div>
</template>

<style scss scoped></style>
