import { Enumerations, WebMidi } from "webmidi";
import type { ChannelRange, IDeviceConfig, IOutputPort, MessageType } from "@/services/types/devices";
import { MessageTypeEnum } from "@/services/types/enums";
import AbstractComunicator from "@/services/classes/AbstractComunicator";
import { sealed } from "@/services/decorators";

const consoleColor = ["%cMidi", "color: #c1656e"];
const timeout = 4000;

@sealed
export default class Midi extends AbstractComunicator {
    public static async init(disabled?: string[]): Promise<Midi | undefined> {
        try {
            console.info(...consoleColor, "Attempting to enable WebMidi...");

            if (!navigator.requestMIDIAccess) {
                throw new Error("WebMIDI API not supported in this browser");
            }

            // Add timeout and better error handling
            const enablePromise = WebMidi.enable({ sysex: true }).catch((error) => {
                console.error(...consoleColor, "Error during WebMidi.enable:", error);
                throw error;
            });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`WebMidi enable timeout after ${timeout}ms`)), timeout);
            });

            await Promise.race([enablePromise, timeoutPromise]);

            if (!WebMidi.enabled) {
                throw new Error("WebMidi not enabled after successful promise");
            }

            // Log solo le informazioni essenziali per evitare riferimenti circolari
            console.info(...consoleColor, "WebMidi enabled successfully");
            console.info(...consoleColor, "Available inputs:", WebMidi.inputs.length);
            console.info(...consoleColor, "Available outputs:", WebMidi.outputs.length);
            console.info(...consoleColor, "Sysex enabled:", WebMidi.interface.sysexEnabled);

            // Gestione più sicura degli input
            // WebMidi.inputs.forEach((entry) => {
            //     try {
            //         entry.addListener("midimessage", (e) =>
            //             Midi.onMIDIMessage(
            //                 e.target,
            //                 e.message.type as MessageType,
            //                 ((e as unknown as Record<string, unknown>).dataBytes as [number, number])[0],
            //                 ((e as unknown as Record<string, unknown>).dataBytes as [number, number])[1]
            //             )
            //         );
            //     } catch (error) {
            //         console.warn(...consoleColor, "Error adding listener to input:", error);
            //     }
            // });

            return new Midi(WebMidi.outputs, disabled ?? [], WebMidi.inputs);
        } catch (err) {
            // Gestione più sicura dell'errore per evitare riferimenti circolari
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            console.error(...consoleColor, "WebMidi initialization failed:", errorMessage);
            console.info(...consoleColor, "Browser:", navigator.userAgent);
            console.info(...consoleColor, "Troubleshooting steps:");
            console.info(...consoleColor, "1. Check if MIDI devices are connected");
            console.info(...consoleColor, "2. For Firefox: ensure dom.webmidi.enabled is true in about:config");
            console.info(...consoleColor, "3. Try using a Chromium-based browser like Chrome or Edge");
            return undefined;
        }
    }

    public isSysexEnabled(): boolean {
        return WebMidi.interface.sysexEnabled;
    }

    private sendControlChange(output: IOutputPort, channel: ChannelRange, note: number, velocity: number, selectedOutboard: IDeviceConfig) {
        output.sendControlChange(note, velocity, { channels: channel });
        const octects = Midi.getPrintableOctects(Enumerations.CHANNEL_MESSAGES.controlchange, channel, note, velocity, 2);
        console.info(...consoleColor, "sending", octects, "through", output.name, "to", selectedOutboard.label);
    }

    private sendProgramChange(output: IOutputPort, channel: ChannelRange, note: number, selectedOutboard: IDeviceConfig) {
        output.sendProgramChange(note, { channels: channel });
        const octects = Midi.getPrintableOctects(Enumerations.CHANNEL_MESSAGES.programchange, channel, note, 0, 2);
        console.info(...consoleColor, "sending", octects, "through", output.name, "to", selectedOutboard.label);
    }

    public send(
        output: IOutputPort | number,
        channel: ChannelRange,
        messageType: MessageType,
        note: number,
        velocity: number,
        selectedOutboard: IDeviceConfig
    ): boolean {
        if (typeof output === "number") output = this._outputs[output];

        switch (messageType) {
            case MessageTypeEnum.ControlChange:
                this.sendControlChange(output, channel, note, velocity, selectedOutboard);
                break;
            case MessageTypeEnum.ProgramChange:
                this.sendProgramChange(output, channel, note, selectedOutboard);
                break;
            default:
                throw new Error(`MessageType ${messageType} not handled`);
        }

        return true;
    }
}
