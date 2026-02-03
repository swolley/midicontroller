import { IEditor, IConsole } from "@/services/types/devices";
import type Midi from "@/services/classes/Midi";
import type { Http } from "@/services/classes/Http";
import type Outboard from "@/services/classes/Outboard";

export type CategorizedDeviceList = Record<string, Outboard[]>;
export interface IAppStoreProps {
    rackDevices: Ref<Outboard[]>;
    availableDevices: Ref<CategorizedDeviceList>;
    midi: Ref<Midi | undefined>;
    http: Ref<Http | undefined>;
    editor: Ref<Outboard | undefined>;
    console: Ref<RackConsole | undefined>;
}

export interface IAppStoreActions {
    init: () => Promise<boolean>;
    device: (id: string) => Outboard | undefined;
    rackDevice: (id: string) => Outboard | undefined;
    storeDevice: (id: string) => Outboard | undefined;
    moveDeviceToRack: (device: Outboard, toIdx: number) => void;
    reorderCategoryDevices: (device: Outboard, fromIdx: number, toIdx: number, fromCategory?: "rack" | keyof CategorizedDeviceList) => void;
    reorderRackDevices: (device: Outboard, fromIdx: number, toIdx: number) => void;
    moveDeviceToCategory: (device: Outboard, toCategory: keyof CategorizedDeviceList, toIdx: number, fromCategory?: "rack" | keyof CategorizedDeviceList) => void;
    moveDeviceBackToStore: (device: Outboard) => void;
    removeDevice: (device: Outboard) => void;
    createNewDevice: () => Outboard;
}
