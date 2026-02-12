import type { ChannelRange, HttpComunicatorConfig, IDeviceConfig, IOutputPort, MessageType } from "@/services/types/devices";
import { MessageTypeEnum } from "@/services/types/enums";
import AbstractComunicator from "@/services/classes/AbstractComunicator";
import HttpOutput from "@/services/classes/HttpOutput";
import { sealed } from "@/services/decorators";

const consoleColor = ["%cHttp", "color: #dcd3bb"];

/** High nibble of MIDI status byte for getPrintableOctects (e.g. 0x0b = control change). */
const MESSAGE_TYPE_NIBBLE: Record<MessageType, number> = {
    [MessageTypeEnum.ControlChange]: 0x0b,
    [MessageTypeEnum.ProgramChange]: 0x0c,
    [MessageTypeEnum.NoteOn]: 0x09,
    [MessageTypeEnum.Sysex]: 0xf,
};

@sealed
export class Http extends AbstractComunicator {
    /**
     * Initialize HTTP comunicator from config. No WebMidi is used; outputs are remote endpoints.
     * Use HTTPS and auth in production.
     */
    public static async init(config: HttpComunicatorConfig, disabled: string[] = []): Promise<Http | undefined> {
        try {
            console.info(...consoleColor, "Initializing HTTP comunicator...");
            if (!config.endpoints?.length) {
                console.warn(...consoleColor, "No endpoints in config");
                return undefined;
            }
            const outputs: IOutputPort[] = config.endpoints.map(
                (ep) =>
                    new HttpOutput({
                        baseUrl: ep.baseUrl,
                        id: ep.id,
                        name: ep.name,
                        auth: config.auth,
                    })
            );
            console.info(...consoleColor, "HTTP outputs:", outputs.length);
            return new Http(outputs, disabled);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(...consoleColor, "HTTP init failed:", msg);
            return undefined;
        }
    }

    public send(
        output: IOutputPort | number,
        channel: ChannelRange,
        messageType: MessageType,
        note: number,
        velocity: number,
        selectedOutboard: IDeviceConfig
    ): boolean {
        const out = typeof output === "number" ? this._outputs[output] : output;
        if (!out) {
            console.error(...consoleColor, "Invalid output index or missing output");
            return false;
        }
        try {
            const messageTypeNibble = MESSAGE_TYPE_NIBBLE[messageType] ?? 0;
            switch (messageType) {
                case MessageTypeEnum.ControlChange:
                    out.sendControlChange(note, velocity, { channels: channel });
                    break;
                case MessageTypeEnum.ProgramChange:
                    out.sendProgramChange(note, { channels: channel });
                    break;
                default:
                    throw new Error(`MessageType ${messageType} not handled`);
            }
            const octects = AbstractComunicator.getPrintableOctects(messageTypeNibble, channel, note, velocity, 2);
            console.info(...consoleColor, "sending", octects, "through", out.name, "to", selectedOutboard.label);
            return true;
        } catch (e) {
            console.error(...consoleColor, (e as Error).message);
            return false;
        }
    }
}
