<script setup lang="ts">
import type { DropResult, IControllerConfigs, ILcdControllerConfigs, IMessageControllerConfigs } from "@/services/types/devices";
import { Container, Draggable } from "vue-dndrop";
import LcdIcon from "@/components/icons/LcdIcon.vue";
import LightLed from "@/components/controllers/LightLed.vue";
import RotaryIcon from "@/components/icons/RotaryIcon.vue";
import IconClose from "@/components/icons/CancelIcon.vue";
import DragIcon from "@/components/icons/DragIcon.vue";
import PlusIcon from "@/components/icons/PlusIcon.vue";
import TrashIcon from "@/components/icons/TrashIcon.vue";
import { ref } from "vue";
import { useRack } from "@/stores/useRack";
import type { Outboard } from "@/services/classes/Outboard";

const props = defineProps<{
    device: Outboard;
}>();

const deviceStore = useRack();
const backgroundInput = ref<HTMLInputElement>();
const panelInput = ref<HTMLInputElement>();
const borderInput = ref<HTMLInputElement>();

function onDrop(dropResult: DropResult, list: "rotaries" | "toggles" | "lcds") {
    // let result = applyDrag(groupIndex === "rack" ? props.rackDevices : props.availableDevices, dropResult);
    //   Vue.set(this.groups, groupIndex, result);
    console.log("drop from", list);
}

function createController(type: "rotaries" | "toggles" | "lcds") {
    const newController = {
        minValue: 0,
        maxValue: 127,
        note: 0,
    };

    switch (type) {
        case "rotaries":
            (newController as IMessageControllerConfigs).type = "ROTARY";
            (newController as IMessageControllerConfigs).label = "rotary-" + (props.device.controllers.rotaries.length + 1);
            props.device.addController(newController as IMessageControllerConfigs);
            break;
        case "toggles":
            (newController as IMessageControllerConfigs).type = "TOGGLE";
            (newController as IMessageControllerConfigs).label = "toggle-" + (props.device.controllers.toggles.length + 1);
            props.device.addController(newController as IMessageControllerConfigs);
            break;
        case "lcds":
            (newController as ILcdControllerConfigs).type = "LCD";
            (newController as IMessageControllerConfigs).label = "lcd-" + (props.device.controllers.lcds.length + 1);
            props.device.addController(newController as ILcdControllerConfigs);
            break;
    }
}

function deleteController(controller: IControllerConfigs) {
    // if (!Validators.isUnsignedInt(index, 0, props.device.controllers[type].length)) throw new Error("no valid color");
    props.device.deleteController(controller);
}

function setBackgroundColor(event: Event, forcedValue?: string) {
    deviceStore.changeDeviceBackgroundColor(props.device, forcedValue || (event.target as HTMLInputElement).value);
}

function setPanelColor(event: Event, forcedValue?: string) {
    deviceStore.changeDevicePanelColor(props.device, forcedValue || (event.target as HTMLInputElement).value);
}

function setBorderColor(event: Event, forcedValue?: string) {
    deviceStore.changeDeviceBorderColor(props.device, forcedValue || (event.target as HTMLInputElement).value);
}

function setLabel(e: Event) {
    deviceStore.changeDeviceLabel(props.device, (e.target as HTMLInputElement).value);
}
</script>

<template>
    <form v-if="device" class="select-none">
        <div class="sticky inset-x-0 top-0 left-0 bg-black/80 border border-white/5 rounded pt-1 z-10 shadow mb-1">
            <div class="flex gap-2 px-2 ml-5" v-if="device">
                <div class="flex flex-col grow">
                    <label for="deviceLabel" class="form-label">label</label>
                    <input type="text" name="deviceLabel" class="form-top-input" @change="setLabel" :value="device.label" required />
                </div>
                <div class="flex flex-col grow">
                    <label for="backgroundColor" class="form-label">background color</label>
                    <div class="form-top-input flex items-center">
                        <div v-show="device.backgroundColor.isTransparent()" class="bg-transparent grow cursor-pointer" @click="() => backgroundInput?.click()">
                            transparent
                        </div>
                        <input
                            v-show="!device.backgroundColor.isTransparent()"
                            ref="backgroundInput"
                            type="color"
                            name="backgroundColor"
                            class="bg-transparent grow cursor-pointer"
                            :value="device.backgroundColor"
                            @change="setBackgroundColor"
                            required
                        />
                        <IconClose
                            v-if="!device.backgroundColor.isTransparent()"
                            class="text-2xl p-1 cursor-pointer"
                            @click="(event) => setBackgroundColor(event, 'transparent')"
                        />
                    </div>
                </div>
                <div class="flex flex-col grow">
                    <label for="panelColor" class="form-label">panel color</label>
                    <div class="form-top-input flex items-center">
                        <div v-show="device.panelColor.isTransparent()" class="bg-transparent grow cursor-pointer" @click="() => panelInput?.click()">
                            transparent
                        </div>
                        <input
                            v-show="!device.panelColor.isTransparent()"
                            ref="panelInput"
                            type="color"
                            name="panelColor"
                            class="bg-transparent grow cursor-pointer"
                            :value="device.panelColor"
                            @change="setPanelColor"
                            required
                        />
                        <IconClose
                            v-if="!device.backgroundColor.isTransparent()"
                            class="text-2xl p-1 cursor-pointer"
                            @click="(event) => setPanelColor(event, 'transparent')"
                        />
                    </div>
                </div>
                <div class="flex flex-col grow">
                    <label for="borderColor" class="form-label">border color</label>
                    <div class="form-top-input flex items-center">
                        <div v-show="device.borderColor.isTransparent()" class="bg-transparent grow cursor-pointer" @click="() => borderInput?.click()">
                            transparent
                        </div>
                        <input
                            v-show="!device.borderColor.isTransparent()"
                            ref="borderInput"
                            type="color"
                            name="borderColor"
                            class="bg-transparent grow cursor-pointer"
                            :value="device.borderColor"
                            @change="setBorderColor"
                            required
                        />
                        <IconClose
                            v-if="!device.backgroundColor.isTransparent()"
                            class="text-2xl p-1 cursor-pointer"
                            @click="(event) => setBorderColor(event, 'transparent')"
                        />
                    </div>
                </div>
            </div>
            <hr class="h-px my-2 ml-7 mr-2 border-white/10" />
        </div>
        <div class="gap-2">
            <template v-for="(controllers, type) in device.controllers" :key="type">
                <label class="form-label">{{ type }}</label>
                <Container
                    class="grow-0 shrink-0 gap-1 shadow-inner"
                    orientation="vertical"
                    lock-axis="y"
                    non-drag-area-selector=".field"
                    drag-handle-selector=".column-drag-handle"
                    :group-name="type"
                    :data-index="'rackDevices_' + type"
                    :get-child-payload="(index: number) => controllers[index]"
                    @drop="(dropResult: DropResult) => onDrop(dropResult, type)"
                >
                    <Draggable v-for="(controller, index) in controllers" :key="index">
                        <fieldset class="border rounded border-white/5 pb-2 pt-1 px-2 flex items-center mb-1 gap-x-2">
                            <DragIcon class="text-white mt-6 mb-0" />
                            <!-- <span
                                class="column-drag-handle text-white opacity-20 hover:opacity-30 transtition-opacity cursor-pointer active:cursor-move flex translate-y-1/2 pr-2"
                                >&#x2630;</span
                            > -->
                            <div class="mt-auto mb-0">
                                <!-- <label for="type" class="form-label">type</label> -->
                                <div class="flex items-center form-select">
                                    <div class="w-5">
                                        <RotaryIcon v-if="controller.type === 'ROTARY'" :pot-style="device.style" />
                                        <LightLed v-else-if="controller.type === 'TOGGLE'" status="off" />
                                        <LcdIcon v-else-if="controller.type === 'LCD'" :invert="false" />
                                    </div>
                                    <!-- <select disabled name="type" class="bg-transparent w-full" v-model="controller.type">
                                        <option value="LCD">lcd</option>
                                        <option value="TOGGLE">toggle</option>
                                        <option value="ROTARY">rotary</option>
                                    </select> -->
                                </div>
                            </div>
                            <div class="grow grid grid-cols-4 gap-2">
                                <div class="flex flex-col field">
                                    <label for="controllerLabel" class="form-label">label</label>
                                    <input type="text" name="controllerLabel" class="form-input" v-model="controller.label" />
                                </div>
                                <div class="flex flex-col field">
                                    <label for="message" class="form-label">message</label>
                                    <select name="message" class="form-select" v-model="controller.message">
                                        <option value="programchange">Program Change</option>
                                        <option value="controlchange">Control Change</option>
                                    </select>
                                </div>
                                <div class="flex flex-col field">
                                    <label for="minValue" class="form-label">min value</label>
                                    <input type="number" name="minValue" class="form-input" v-model="controller.minValue" min="0" max="127" step="1" />
                                </div>
                                <div class="flex flex-col field">
                                    <label for="maxValue" class="form-label">min value</label>
                                    <input type="number" name="maxValue" class="form-input" v-model="controller.maxValue" min="0" max="127" step="1" />
                                </div>
                            </div>
                            <div class="mt-auto mb-0">
                                <button
                                    type="button"
                                    class="btn btn-outline opacity-40 bg-black text-white flex items-center form-select hover:bg-red-400 hover:text-white"
                                    @click.stop="deleteController(controller)"
                                >
                                    <TrashIcon class="w-8" />
                                </button>
                            </div>
                        </fieldset>
                    </Draggable>
                </Container>
                <div
                    type="button"
                    class="rounded border-2 border-dashed flex items-center justify-center px-2 py-1 m-1 mb-4 opacity-30 hover:opacity-70 transition-opacity cursor-pointer"
                    @click="createController(type)"
                >
                    <PlusIcon class="text-gray-100 text-xl" />
                </div>
            </template>
        </div>
    </form>
</template>

<style scoped lang="scss">
.dndrop-container {
    min-height: 0;
}
</style>
