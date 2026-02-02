import Midi from "@/services/classes/Midi";
import RackConsole from "@/services/classes/RackConsole";
import type { IDeviceConfig } from "@/services/types/devices";
import type { CategorizedDeviceList, IAppStoreProps } from "@/services/types/stores";
import { defineStore, type StateTree } from "pinia";
import type { Output } from "webmidi";
import outboards from "../../config/outboard";
import Outboard from "@/services/classes/Outboard";

const consoleColor = ["%cRackStore", "color: #437bad"];

function checkBeforeMoveDevice(list: Outboard[], index: number) {
    if (index < 0) throw new Error("Position cannot be negative");
    if (index > list.length) throw new Error("Position cannot be out of range");
}

function logInitFinished(totalDevices: number, totalCategories: number) {
    console.info(
        ...consoleColor,
        `Initialized ${totalDevices} ${totalDevices === 1 ? "device" : "devices"} in ${totalCategories} ${totalCategories === 1 ? "category" : "categories"}`
    );
}

function moveDevice(
    fromList: Outboard[],
    fromIdx: number,
    toList: Outboard[],
    toIdx: number,
    fromName: "rack" | keyof CategorizedDeviceList,
    toName: "rack" | keyof CategorizedDeviceList,
    device: Outboard
) {
    if (fromIdx === -1) throw new Error(`Device ${device.id} not found in ${fromName} list`);
    if (toIdx === -1) throw new Error(`Device ${device.id} not found in ${toName} list`);
    checkBeforeMoveDevice(fromList, fromIdx);
    checkBeforeMoveDevice(toList, toIdx);
    const removed = fromList.splice(fromIdx, 1)[0];
    if (!removed) throw new Error(`Unable to remove device from ${fromName} list`);
    if (toName !== "rack" && device.category !== toName) removed.category = toName;
    toList.splice(toIdx, 0, removed);
    if (fromName !== toName) console.info(...consoleColor, `Device ${device.id} moved to ${toName} list`);
}

export const useRack = defineStore("rack", {
    state: (): IAppStoreProps => {
        return {
            // devices
            rackDevices: [],
            availableDevices: {},
            console: undefined,
            editor: undefined,
            // connectors
            midi: undefined,
            http: undefined,
        };
    },
    getters: {
        device: (state) => (id: string) => {
            return (
                (state.rackDevices as Outboard[]).find((d: Outboard) => d.id === id) ||
                Object.values(state.availableDevices)
                    .flat()
                    .find((d: Outboard) => d.id === id)
            );
        },
        rackDevice: (state) => (id: string) => {
            return (state.rackDevices as Outboard[]).find((d: Outboard) => d.id === id);
        },
        storeDevice: (state) => (id: string) => {
            return Object.values(state.availableDevices)
                .flat()
                .find((d: Outboard) => d.id === id);
        },
        interfaces: (state) => () => {
            return [...(state.midi ? (state.midi.activeOutputs as Output[]) : []), ...(state.http ? (state.http.activeOutputs as unknown[]) : [])];
        },
        totalDevices: (state) =>
            Object.values(state.availableDevices).reduce((acc: number, category: Outboard[]) => acc + category.length, 0) + state.rackDevices.length,
    },
    actions: {
        async init() {
            try {
                if (!Object.keys(this.availableDevices).length) {
                    const groups: Record<string, Outboard[]> = {};
                    const sorted = outboards.sort((a: IDeviceConfig, b: IDeviceConfig) =>
                        (a.category || "uncategozized") < (b.category || "uncategozized") && a.label < b.label ? 1 : -1
                    );

                    sorted.forEach((device) => {
                        if (!device.category) device.category = "uncategorized";
                        const outboard = new Outboard(device);
                        if (!((device.category as string) in groups)) {
                            groups[device.category] = [outboard];
                        } else {
                            groups[device.category].push(outboard);
                        }
                    });

                    this.availableDevices = groups;

                    logInitFinished(
                        Object.values(this.availableDevices).reduce((acc: number, category: Outboard[]) => acc + category.length, 0),
                        Object.keys(this.availableDevices).length
                    );
                }

                this.console = new RackConsole();
                this.midi = await Midi.init();
                // this.http = await Http.init();
                return this.midi !== undefined;
            } catch (e) {
                console.error(...consoleColor, (e as Error).message);
                return false;
            }
        },
        moveDeviceToRack(device: Outboard, toIdx: number) {
            try {
                const fromCategory = device.category;
                if (!(fromCategory in this.availableDevices)) throw new Error(`Category ${fromCategory} not available`);
                const fromIdx = this.availableDevices[fromCategory].findIndex((d: Outboard) => d.id === device.id);
                moveDevice(this.availableDevices[fromCategory], fromIdx, this.rackDevices as Outboard[], toIdx, fromCategory, "rack", device);
            } catch (e) {
                console.error(...consoleColor, (e as Error).message);
            }
        },
        reorderCategoryDevices(device: Outboard, fromIdx: number, toIdx: number, fromCategory?: "rack" | keyof CategorizedDeviceList) {
            try {
                let originList: Outboard[] = this.rackDevices as Outboard[];
                if (fromCategory !== "rack") {
                    fromCategory = device.category;
                    if (!(fromCategory in this.availableDevices)) throw new Error(`Category ${fromCategory} not available`);
                    originList = this.availableDevices[fromCategory];
                }
                moveDevice(originList, fromIdx, originList, toIdx, fromCategory, fromCategory, device);
            } catch (e) {
                console.error(...consoleColor, (e as Error).message);
            }
        },
        reorderRackDevices(device: Outboard, fromIdx: number, toIdx: number) {
            this.reorderCategoryDevices(device, fromIdx, toIdx, "rack");
        },
        moveDeviceToCategory(device: Outboard, toCategory: keyof CategorizedDeviceList, toIdx: number, fromCategory?: "rack" | keyof CategorizedDeviceList) {
            try {
                let originList: Outboard[] = this.rackDevices as Outboard[];
                if (fromCategory !== "rack") {
                    fromCategory = device.category;
                    if (!(fromCategory in this.availableDevices)) throw new Error(`Category ${fromCategory} not available`);
                    originList = this.availableDevices[fromCategory];
                }
                if (!(toCategory in this.availableDevices)) throw new Error(`Category ${toCategory} not available`);
                const destinatioList = this.availableDevices[toCategory];
                const fromIdx = originList.findIndex((d: Outboard) => d.id === device.id);

                moveDevice(originList, fromIdx, destinatioList, toIdx, fromCategory, toCategory, device);
            } catch (e) {
                console.error(...consoleColor, (e as Error).message);
            }
        },
        moveDeviceBackToStore(device: Outboard) {
            this.moveDeviceToCategory(device, device.category, this.availableDevices[device.category].length, "rack");
        },
        removeDevice(device: Outboard) {
            if (device.stock) return;
            for (const category in this.availableDevices) {
                const list = this.availableDevices[category];
                const found = list.findIndex((d: IDeviceConfig) => d.id === device.id);
                if (found !== -1) {
                    list.splice(found, 1)[0];
                    break;
                }
            }
        },
        createNewDevice(): Outboard {
            const name = "device-" + (this.totalDevices + 1);
            const newDevice: IDeviceConfig = {
                backgroundColor: "transparent",
                category: "uncategorized",
                id: name,
                label: name,
                stock: false,
                // channel: 1,
                controllers: {
                    lcds: [],
                    toggles: [],
                    rotaries: [],
                },
            };
            console.info(...consoleColor, "Created new Device for editor");

            return new Outboard(newDevice);
        },

        // changeDeviceInterface(device: Outboard, outputInterface: Output | undefined) {
        //     device.outputInterface = outputInterface;
        // },
        // changeDeviceBackgroundColor(device: Outboard, backgroundColor: string) {
        //     device.backgroundColor = backgroundColor;
        // },
        // changeDevicePanelColor(device: Outboard, panelColor: string) {
        //     device.panelColor = panelColor;
        // },
        // changeDeviceBorderColor(device: Outboard, borderColor: string) {
        //     device.borderColor = borderColor;
        // },
        // changeDeviceId(device: Outboard, id: string) {
        //     device.id = id;
        // },
        // changeDeviceLabel(device: Outboard, label: string) {
        //     device.label = label;
        // },
    },
    persist: {
        key: "rack",
        storage: localStorage,
        paths: ["rackDevices", "availableDevices"],
        debug: import.meta.env.DEV,
        serializer: {
            /** Serialize to plain JSON (JS has no PHP-style serialize; we use toJSON + reconstruct on load). */
            serialize(state: StateTree) {
                const s = state as IAppStoreProps;
                const rackDevices = (s.rackDevices as Outboard[]).map((d) => d.toJSON());
                const availableDevices: Record<string, IDeviceConfig[]> = {};
                for (const category of Object.keys(s.availableDevices)) {
                    availableDevices[category] = (s.availableDevices[category] as Outboard[]).map((d) => d.toJSON());
                }
                return JSON.stringify({ rackDevices, availableDevices });
            },
            /** Deserialize and reconstruct class instances (plain object -> new Outboard(d)). */
            deserialize(value: string): StateTree {
                try {
                    const raw = JSON.parse(value) as Record<string, unknown>;
                    if (!raw || typeof raw !== "object") return { rackDevices: [], availableDevices: {} };

                    const rackDevices = Array.isArray(raw.rackDevices)
                        ? (raw.rackDevices as IDeviceConfig[]).map((d) => new Outboard(d))
                        : [];

                    const availableDevices: CategorizedDeviceList = {};
                    if (raw.availableDevices && typeof raw.availableDevices === "object" && !Array.isArray(raw.availableDevices)) {
                        for (const category of Object.keys(raw.availableDevices)) {
                            const list = (raw.availableDevices as Record<string, unknown[]>)[category];
                            availableDevices[category] = Array.isArray(list) ? (list as IDeviceConfig[]).map((d) => new Outboard(d)) : [];
                        }
                    }

                    return { rackDevices, availableDevices };
                } catch (e) {
                    if (import.meta.env.DEV) console.error(...consoleColor, "Failed to restore persisted state", e);
                    return { rackDevices: [], availableDevices: {} };
                }
            },
        },
    },
});
