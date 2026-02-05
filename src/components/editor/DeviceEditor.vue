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
import type Outboard from "@/services/classes/Outboard";

const props = defineProps<{
    device: Outboard;
}>();

const backgroundInput = ref<HTMLInputElement>();
const panelInput = ref<HTMLInputElement>();
const borderInput = ref<HTMLInputElement>();
const logoInput = ref<HTMLInputElement>();

/** Same reference as props.device so mutations are visible to the parent (HomeView). */
const editingDevice = props.device;

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
            (newController as IMessageControllerConfigs).message = "controlchange";
            (newController as IMessageControllerConfigs).label = "rotary-" + (editingDevice.controllers.rotaries.length + 1);
            editingDevice.addController(newController as IMessageControllerConfigs);
            break;
            case "toggles":
            (newController as IMessageControllerConfigs).type = "TOGGLE";
            (newController as IMessageControllerConfigs).message = "controlchange";
            (newController as IMessageControllerConfigs).label = "toggle-" + (editingDevice.controllers.toggles.length + 1);
            editingDevice.addController(newController as IMessageControllerConfigs);
            break;
            case "lcds":
            (newController as ILcdControllerConfigs).type = "LCD";
            (newController as IMessageControllerConfigs).message = "programchange";
            (newController as IMessageControllerConfigs).label = "lcd-" + (editingDevice.controllers.lcds.length + 1);
            editingDevice.addController(newController as ILcdControllerConfigs);
            break;
    }
}

function deleteController(controller: IControllerConfigs) {
    // if (!Validators.isUnsignedInt(index, 0, editingDevice.controllers[type].length)) throw new Error("no valid color");
    editingDevice.deleteController(controller);
}

function setBackgroundColor(event: Event, forcedValue?: string) {
    (editingDevice as Outboard).backgroundColor = forcedValue || (event.target as HTMLInputElement).value;
    // deviceStore.changeDeviceBackgroundColor(editingDevice as Outboard, forcedValue || (event.target as HTMLInputElement).value);
}

function setPanelColor(event: Event, forcedValue?: string) {
    (editingDevice as Outboard).panelColor = (editingDevice as Outboard, forcedValue || (event.target as HTMLInputElement).value);
}

function setBorderColor(event: Event, forcedValue?: string) {
    (editingDevice as Outboard).borderColor = (editingDevice as Outboard, forcedValue || (event.target as HTMLInputElement).value);
}

function setLabel(e: Event) {
    (editingDevice as Outboard).label = (editingDevice as Outboard, (e.target as HTMLInputElement).value);
}

function setLogo(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            (editingDevice as Outboard).logo = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
}

function clearLogo() {
    (editingDevice as Outboard).logo = undefined;
}
</script>

<template>
    <form v-if="device" class="select-none">
        <div class="inset-x-0 bg-black/80 border border-white/5 rounded pt-1 z-10 shadow mb-1">
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
                            :value="device.backgroundColor.toHex(false)"
                            @change="setBackgroundColor"
                            required
                        />
                        <IconClose
                            v-if="!device.backgroundColor.isTransparent()"
                            class="text-2xl p-1 cursor-pointer"
                            @click="(event: Event) => setBackgroundColor(event, 'transparent')"
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
                            :value="device.panelColor.toHex(false)"
                            @change="setPanelColor"
                            required
                        />
                        <IconClose
                            v-if="!device.backgroundColor.isTransparent()"
                            class="text-2xl p-1 cursor-pointer"
                            @click="(event: Event) => setPanelColor(event, 'transparent')"
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
                            :value="device.borderColor.toHex(false)"
                            @change="setBorderColor"
                            required
                        />
                        <IconClose
                            v-if="!device.backgroundColor.isTransparent()"
                            class="text-2xl p-1 cursor-pointer"
                            @click="(event: Event) => setBorderColor(event, 'transparent')"
                        />
                    </div>
                </div>
            </div>
            <div class="flex gap-2 px-2 ml-5 mt-2 items-end">
                <div class="flex flex-col grow">
                    <label for="deviceLogo" class="form-label">logo</label>
                    <input
                    ref="logoInput"
                        id="deviceLogo"
                        type="file"
                        name="deviceLogo"
                        class="hidden"
                        accept=".png, .jpg, .jpeg, .gif, .svg"
                        @change="setLogo"
                    />
                    <div class="form-top-input flex items-center gap-2 min-h-[2.5rem]">
                        <button
                            type="button"
                            class="rounded border border-white/20 px-2 py-1 text-sm text-white/80 hover:bg-white/10"
                            @click="logoInput?.click()"
                        >
                            Choose image
                        </button>
                        <template v-if="device.logo">
                            <img
                                :src="device.logo"
                                alt="Logo preview"
                                class="max-h-12 max-w-[140px] object-contain bg-white/5 rounded border border-white/10"
                            />
                            <IconClose
                                class="text-2xl p-1 cursor-pointer shrink-0"
                                aria-label="Remove logo"
                                @click="clearLogo"
                            />
                        </template>
                        <span v-else class="text-white/40 text-sm">No image</span>
                    </div>
                </div>
                <div class="flex flex-col grow">
                    <label for="style" class="form-label">style</label>
                    <select name="style" class="form-select" v-model="device.style">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="metal">Metal</option>
                    </select>
                </div>
            </div>
            <hr class="h-px my-2 ml-7 mr-2 border-white/10" />
        </div>
        <div class="gap-2">
            <template v-for="(controllers, type) in device.controllers" :key="type">
                <label class="form-label">{{ type }}</label>
                <Container
                    class="grow-0 shrink-0 gap-1 shadow-inner"
                    drag-class="dndrop-dragging-ghost"
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
                                        <StepIcon v-if="device.style === 'step'" />
                                        <RotaryIcon v-else-if="controller.type === 'ROTARY'" :pot-style="device.style" />
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
                <button
                    type="button"
                    class="rounded border-2 border-dashed flex w-full items-center justify-center px-2 py-1 m-1 mb-4 opacity-30 hover:opacity-70 transition-opacity cursor-pointer"
                    @click="createController(type)"
                >
                    <PlusIcon class="text-gray-100 text-xl" />
                </button>
            </template>
        </div>
    </form>
</template>

<style scoped lang="scss">
.dndrop-container {
    min-height: 0;
}
</style>
