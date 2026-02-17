import type Outboard from "@/services/classes/Outboard";
import type { Ref } from "vue";

export type { MessageType, ControllerType, RotaryStyle, LogType, ToggleStatus } from "./enums";
export { MessageTypeEnum, ControllerTypeEnum, RotaryStyleEnum, LogTypeEnum, ToggleStatusEnum, HttpAuthTypeEnum } from "./enums";

type PrependNextNum<A extends Array<unknown>> = A["length"] extends infer T ? (((t: T, ...a: A) => void) extends (...x: infer X) => void ? X : never) : never;
type EnumerateInternal<A extends Array<unknown>, N extends number> = { 0: A; 1: EnumerateInternal<PrependNextNum<A>, N> }[N extends A["length"] ? 0 : 1];
type Enumerate<N extends number> = EnumerateInternal<[], N> extends (infer E)[] ? E : never;
type Range<FROM extends number, TO extends number> = Exclude<Enumerate<TO>, Enumerate<FROM>>;

export type StepStyle = "arrow" | "dot" | string;

/** MIDI channel 1–16. */
export type ChannelRange = Range<1, 17>;

/** MIDI note or controller number 0–127. */
export type NoteRange = Range<0, 128>;

/** MIDI velocity or value 0–127. */
export type MidiVelocityRange = Range<0, 128>;

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
    style?: RotaryStyle;
    stock: boolean;
    category?: string;
    controllers: IDeviceControllers;
    logo?: string;
}

export interface IControllerConfigs {
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
    type: "TOGGLE" | "ROTARY" | "STEP";
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

/** Options passed to sendControlChange / sendProgramChange (channel 1-16 or list). */
export interface IOutputPortOptions {
    channels: number | number[];
}

/**
 * Common interface for any MIDI-like output (WebMidi Output or HTTP remote endpoint).
 * Used so that Midi and Http comunicators expose the same output shape to the UI.
 */
export interface IOutputPort {
    id: string;
    name: string;
    manufacturer?: string;
    sendControlChange(note: number, velocity: number, options: IOutputPortOptions): void | this;
    sendProgramChange(note: number, options: IOutputPortOptions): void | this;
}

/** Auth config for HTTP comunicator (Bearer token or API key). */
export type HttpComunicatorAuth = { type: "bearer"; token: string } | { type: "apikey"; key: string };

/** Config for a single HTTP endpoint (remote server with MIDI). */
export interface HttpComunicatorEndpointConfig {
    baseUrl: string;
    id?: string;
    name?: string;
}

/** Config passed to Http.init() to create HTTP outputs. */
export interface HttpComunicatorConfig {
    endpoints: HttpComunicatorEndpointConfig[];
    auth: HttpComunicatorAuth;
}

/**
 * Single communicator contract: same public API for Midi and Http.
 * Use this type in components that accept either Midi or Http.
 */
export interface IComunicator {
    readonly outputs: IOutputPort[];
    readonly activeOutputs: IOutputPort[];
    /**
     * Sends a MIDI message through the given output.
     * @param output          - output port instance or index into outputs array
     * @param channel         - MIDI channel (1-16)
     * @param messageType     - type of message (e.g. controlchange, programchange)
     * @param note            - note or controller number (0-127)
     * @param velocity        - velocity or value (0-127)
     * @param selectedOutboard - device config (for logging only)
     * @returns true if the message was sent, false on error (e.g. invalid output index)
     */
    send(
        output: IOutputPort | number,
        channel: ChannelRange,
        messageType: MessageType,
        note: number,
        velocity: number,
        selectedOutboard: IDeviceConfig
    ): boolean;
}
