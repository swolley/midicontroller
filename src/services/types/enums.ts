/**
 * Centralized enums for the services layer.
 * Use these instead of string literals for type safety and autocomplete.
 */

/** MIDI message types supported by the comunicator (controlchange, programchange, etc.). */
export enum MessageTypeEnum {
    ControlChange = "controlchange",
    ProgramChange = "programchange",
    NoteOn = "noteon",
    Sysex = "sysex",
}

/** Controller kinds in device config (LCD, TOGGLE, ROTARY, STEP). */
export enum ControllerTypeEnum {
    LCD = "LCD",
    Toggle = "TOGGLE",
    Rotary = "ROTARY",
    Step = "STEP",
}

/** Rotary knob visual style. */
export enum RotaryStyleEnum {
    Light = "light",
    Dark = "dark",
    Metal = "metal",
}

/** Console log severity. */
export enum LogTypeEnum {
    Success = "success",
    Info = "info",
    Warn = "warn",
    Error = "error",
}

/** HTTP comunicator authentication kind. */
export enum HttpAuthTypeEnum {
    Bearer = "bearer",
    ApiKey = "apikey",
}

/** Toggle / LED on-off state. */
export enum ToggleStatusEnum {
    On = "on",
    Off = "off",
}

/** Type aliases derived from enums (single source of truth). */
export type MessageType = MessageTypeEnum[keyof typeof MessageTypeEnum];
export type ControllerType = ControllerTypeEnum[keyof typeof ControllerTypeEnum];
export type RotaryStyle = RotaryStyleEnum[keyof typeof RotaryStyleEnum];
export type LogType = LogTypeEnum[keyof typeof LogTypeEnum];
export type ToggleStatus = ToggleStatusEnum[keyof typeof ToggleStatusEnum];
