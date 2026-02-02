import { IEditor, IConsole } from "@/services/types/devices";
import type Midi from "@/services/classes/Midi";
import type { Http } from "@/services/classes/Http";
import type Outboard from "@/services/classes/Outboard";

export type CategorizedDeviceList = Record<string, Outboard[]>;
export interface IAppStoreProps {
    rackDevices: Outboard[];
    availableDevices: CategorizedDeviceList;
    // inputs: WebMidi.inputs;
    // outputs: WebMidi.outputs;
    midi?: Midi;
    http?: Http;
    editor?: IEditor;
    console?: IConsole;
}
