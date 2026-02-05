import type Outboard from "@/services/classes/Outboard";
import type { Ref } from "vue";

type PrependNextNum<A extends Array<unknown>> = A["length"] extends infer T ? (((t: T, ...a: A) => void) extends (...x: infer X) => void ? X : never) : never;
type EnumerateInternal<A extends Array<unknown>, N extends number> = { 0: A; 1: EnumerateInternal<PrependNextNum<A>, N> }[N extends A["length"] ? 0 : 1];
type Enumerate<N extends number> = EnumerateInternal<[], N> extends (infer E)[] ? E : never;
type Range<FROM extends number, TO extends number> = Exclude<Enumerate<TO>, Enumerate<FROM>>;

export type ChannelRange = Range<1, 17>;
// type NoteRange = Range<0, 128>;

export interface IDeviceControllers {
    lcds: ILcdControllerConfigs[];
    toggles: IMessageControllerConfigs[];
    rotaries: IMessageControllerConfigs[];
}

export interface IDeviceConfig {
    id: string;
    label: string;
    backgroundColor: string | Color;
    panelColor?: string | Color;
    borderColor?: string | Color;
    borderSize?: number;
    style?: VariableStyle;
    stock: boolean;
    category?: string;
    controllers: IDeviceControllers;
    logo?: string;
}

export type ControllerType = "LCD" | "TOGGLE" | "ROTARY";

export type MessageType = "controlchange" | "programchange" | "noteon" | /*"noteoff" |*/ "sysex";

export type RotaryStyle = "light" | "dark" | "metal";

export type VariableStyle = RotaryStyle | "step";

interface IControllerConfigs {
    note?: number; //NoteRange;
    type: ControllerType;
    label: string;
    message: MessageType;
    default?: number;
    minValue?: number;
    maxValue?: number;
    value?: number;
    group?: number;
}

export interface ILcdControllerConfigs extends IControllerConfigs {
    type: "LCD";
}

export interface IMessageControllerConfigs extends IControllerConfigs {
    type: "TOGGLE" | "ROTARY";
    minValue?: number; //NoteRange;
    maxValue?: number; //NoteRange;
    note: number; //NoteRange;
}

export interface IEditor {
    id: string;
}

export interface IConsoleLog {
    id: string;
    type: LogType;
    message: string;
    timestamp: Date;
}

export interface IConsole {
    logs: Ref<IConsoleLog[]>;
}

export type LogType = "success" | "info" | "warn" | "error";

export type ToggleStatus = "on" | "off";

export type LedStatus = LogType | ToggleStatus;

export interface DragResult {
    payload: unknown;
    isSource: boolean;
    willAcceptDrop: boolean;
}

export interface DropResult {
    addedIndex: number;
    removedIndex: number;
    element: Element;
    payload: {
        list: string;
        device: Outboard;
    };
}

export interface IComunicatorInterface {
    /**
     * send midi message
     * @param {string|object} outputIdx 	- midi message type
     * @param {string} channel 				- message channel
     * @param {string} messageType 			- midi message type
     * @param {number} deviceIdx 			- midi interface index
     * @param {number} note 				- message note
     * @param {number} velocity 			- message velocity
     * @param {number} selectedOutboardIdx 	- outboard index
     */
    public send(
        output: Output | number,
        channel: ChannelRange,
        messageType: MessageType,
        note: number,
        velocity: number,
        selectedOutboard: IDeviceConfig
    ): boolean;
}
