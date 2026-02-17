<script lang="ts" setup>
import DeviceContainer from "./DeviceContainer.vue";
import type { IMessageControllerConfigs, ILcdControllerConfigs, LedStatus } from "@/services/types/devices";
import { useColors } from "@/composables/useColors";
import { ref } from "vue";
import { useDevice } from "@/composables/useDevice";
// import UploadIcon from "../icons/UploadIcon.vue";
// import DownloadIcon from "../icons/DownloadIcon.vue";
import LightLed from "@/components/controllers/LightLed.vue";
import ToggleButton from "@/components/controllers/ToggleButton.vue";
import LcdDisplay from "@/components/controllers/LcdDisplay.vue";
import LcdSwitch from "@/components/controllers/LcdSwitch.vue";
import RotaryButton from "@/components/controllers/RotaryButton.vue";
import StepButton from "@/components/controllers/StepButton.vue";
import PaletteIcon from "@/components/icons/PaletteIcon.vue";
import type Outboard from "@/services/classes/Outboard";
import TrashIcon from "@/components/icons/TrashIcon.vue";
import type { IComunicator, IOutputPort } from "@/services/types/devices";

const props = defineProps<{
    collapsable: boolean;
    collapsed: boolean;
    selected: boolean;
    device: Outboard;
    isSelected: boolean;
    draggable?: boolean;
    midi: IComunicator;
}>();

const { lcds, rotaries, toggles, currentDevice } = useDevice(props.device);
// const deviceStore = useRack();
const outPanel = useColors(currentDevice.backgroundColor);
const overPanel = useColors(!currentDevice.panelColor.isTransparent() ? currentDevice.panelColor : currentDevice.backgroundColor);
const lightStatus = ref<LedStatus>("off");
const midiChannels = Array.from(Array(16).keys(), (n) => n + 1);
const selectedInterface = ref<number>(0);
const patchSelector = ref<ILcdControllerConfigs | undefined>(currentDevice.controllers.lcds.find((lcd) => lcd.message === "programchange"));

const lastNote = ref<number | undefined>();
const lastValue = ref<string | undefined>();

let blinkTimeout: NodeJS.Timeout | null = null;
let displayTimeout: NodeJS.Timeout | null = null;
const blinkDuration = 300;

function changeInteface(output: IOutputPort | undefined) {
    // deviceStore.changeDeviceInterface(currentDevice, output);
    currentDevice.outputInterface = output;
}

function handleBlink(sent: boolean) {
    if (blinkTimeout) clearTimeout(blinkTimeout);
    lightStatus.value = sent ? "success" : "error";
    blinkTimeout = setTimeout(() => (lightStatus.value = "off"), blinkDuration);
}
function handleDisplay(value: string, note?: number) {
    if (displayTimeout) clearTimeout(displayTimeout);
    lastValue.value = value;
    lastNote.value = note;
    displayTimeout = setTimeout(() => {
        lastValue.value = undefined;
        lastNote.value = undefined;
    }, blinkDuration);
}

function dispatchToggle(controller: IMessageControllerConfigs, active: boolean) {
    handleDisplay(active ? "on" : "off", controller.note);
    const newValue = active ? controller.maxValue || 127 : controller.minValue || 0;
    
    const sent = props.midi.send(
        props.midi.outputs[selectedInterface.value],
        currentDevice.channel,
        controller.message,
        controller.note,
        newValue,
        currentDevice
    );

    if (sent && controller.group) {
        console.log("ORIGINAL", controller.label, controller.group, newValue);
        
        props.device.controllers.toggles.forEach((toggle) => {
            if (active && toggle !== controller && toggle.group === controller.group) {
                toggle.value = toggle.minValue || 0;
                console.log("SAME GROUP", toggle.label, toggle.group, toggle.value);
            }
        });
    }

    handleBlink(sent);
}

function dispatchPCMessage(controller: ILcdControllerConfigs, value: number) {
    if (value >= (controller.minValue || 0) && value <= (controller.maxValue || 127)) {
        const sent = props.midi.send(props.midi.outputs[selectedInterface.value], currentDevice.channel, controller.message, value, value, currentDevice);
        handleBlink(sent);
    }
}
function dispatchCCMessage(controller: IMessageControllerConfigs, value: number) {
    if (value >= (controller.minValue || 0) && value <= (controller.maxValue || 127)) {
        handleDisplay(value + "", controller.note);
        const sent = props.midi.send(
            props.midi.outputs[selectedInterface.value],
            currentDevice.channel,
            controller.message,
            controller.note,
            value,
            currentDevice
        );
        handleBlink(sent);
    }
}
</script>

<template>
    <DeviceContainer
        :background="device.backgroundColor"
        :collapsable="collapsable"
        :collapsed="collapsed"
        :selected="selected"
        :draggable="draggable"
        display="vertical"
        :data-id="device.id"
        :label="device.label"
        class="device-container"
    >
        <template v-slot:collapsedPreview>
            <img v-if="device.logo" :src="device.logo" class="opacity-90 object-contain max-h-14 max-w-[140px]" alt="" />
        </template>
        <template v-slot:header>
            <div class="flex items-center gap-2" :class="!isSelected ? 'opacity-40 pointer-events-none' : ''">
                <LightLed :status="lightStatus" class="mr-2" />
                <button v-if="!device.stock" class="btn btn-outline h-6 aspect-square" :class="{ invert: outPanel.isFgInverted }" title="Open Device Settings">
                    <PaletteIcon @click="$emit('openeditor')" @touchend="$emit('openeditor')" />
                </button>
                <button class="btn btn-outline h-6 aspect-square bg-red-800 text-white" title="Move back to Catalog">
                    <TrashIcon @click="$emit('removedevice')" @touchend="$emit('removedevice')" />
                </button>
                <!-- <template v-if="midi.isSysexEnabled() && hasPatch">
                    <button class="btn btn-outline h-6 aspect-square" :class="{ invert: outPanel.isFgInverted }" title="Send Sysex message">
                        <UploadIcon />
                    </button>
                    <button class="btn btn-outline h-6 aspect-square" :class="{ invert: outPanel.isFgInverted }" title="Get Sysex message">
                        <DownloadIcon />
                    </button>
                </template> -->
                <select class="btn border-3d text-xs uppercase h-6" :class="{ invert: outPanel.isFgInverted }" title="Set Midi input/output Interface">
                    <option :value="undefined" @change="changeInteface(undefined)" :selected="device.outputInterface === undefined"></option>
                    <option
                        v-for="(output, idx) in midi.activeOutputs"
                        :key="idx"
                        :value="idx"
                        @change="changeInteface(output)"
                        :selected="device.outputInterface === output"
                    >
                        {{ (output.manufacturer ? output.manufacturer + " - " : "") + output.name }}
                    </option>
                </select>
                <select class="btn border-3d text-xs uppercase h-6" :class="{ invert: outPanel.isFgInverted }" title="Set Midi channel">
                    <option v-for="channel in midiChannels" :key="channel" :value="channel">
                        {{ "Channel " + ("0" + channel).substr(-2) }}
                    </option>
                </select>
            </div>
        </template>

        <div class="flex justify-between grow mt-2 gap-3">
            <div class="flex flex-col xl:flex-row gap-1 items-center justify-center xl:w-42">
                <LcdDisplay :invert="outPanel.isFgInverted" label="value" :value="lastValue" :note="lastNote" />
                <LcdSwitch
                    v-if="patchSelector"
                    :controller="patchSelector"
                    :invert="outPanel.isFgInverted"
                    @changevalue="(value: number) => dispatchPCMessage(patchSelector as ILcdControllerConfigs, value)"
                />
            </div>
            <div
                class="flex flex-col lg:flex-row py-2 px-3 rounded-lg gap-2 items-center justify-center mx-5 grow relative"
                :class="{ 'shadow-md': device.borderSize || (device.panelColor && !device.panelColor.isTransparent()) }"
                :style="{
                    'background-color': device.panelColor.toRgb() || 'transparent',
                    'border-width': `${device.borderSize || 0}px`,
                    'border-color': device.borderColor.toRgb() || 'transparent',
                    'border-style': 'solid',
                }"
            >
                <div class="shrink items-center mr-4 mb-1 xl:mb-0 grow">
                    <img v-if="device.logo" :src="device.logo" class="opacity-90 device-logo max-w-[160px] max-h-[68px]" />
                </div>

                <div class="flex flex-col md:flex-row gap-2 items-center md:items-start">
                    <div class="grid gap-2 grid-flow-col" v-if="lcds.length > 0 || (patchSelector && lcds.length > 1)">
                        <template v-for="(lcd, idx) in lcds" :key="idx">
                            <LcdSwitch
                                v-if="lcd !== patchSelector"
                                :controller="lcd"
                                :invert="outPanel.isFgInverted"
                                @changevalue="(value: number) => dispatchPCMessage(patchSelector as ILcdControllerConfigs, value)"
                            />
                        </template>
                    </div>
                    <div class="flex flex-wrap gap-1" v-if="toggles.length">
                        <ToggleButton
                            v-for="(toggle, idx) in toggles"
                            class="w-16 justify-start my-2"
                            :key="idx"
                            @changevalue="(active: boolean) => dispatchToggle(toggle, active)"
                            :label="toggle.label"
                            :invert="overPanel.isFgInverted"
                            :data-controller="toggle.label"
                            :active="toggle.value === (toggle.maxValue || 127)"
                        />
                    </div>
                    <div class="flex flex-wrap gap-3 items-start" v-if="rotaries.length">
                        <template v-for="(rotary, idx) in rotaries" :key="idx">
                            <StepButton
                                v-if="rotary.type === 'STEP'"
                                class="w-16"
                                :controller="rotary"
                                :invert="overPanel.isFgInverted"
                                :style="device.style || 'dark'"
                                @changevalue="(value: number) => dispatchCCMessage(rotary, value)"
                            />
                            <RotaryButton
                                v-else
                                class="w-16"
                                :controller="rotary"
                                :invert="overPanel.isFgInverted"
                                :style="device.style || 'dark'"
                                @changevalue="(value: number) => dispatchCCMessage(rotary, value)"
                            />
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </DeviceContainer>
</template>

<style scoped lang="scss">
.complete-layout {
    @apply grid grid-cols-3 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5;
}

.rotaries-layout {
    @apply flex flex-wrap
}
</style>
