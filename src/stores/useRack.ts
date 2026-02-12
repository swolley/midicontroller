import Midi from "@/services/classes/Midi";
import { useConsole } from "@/stores/useConsole";
import type { IDeviceConfig } from "@/services/types/devices";
import type { CategorizedDeviceList, IAppStoreProps, IAppStoreActions } from "@/services/types/stores";
import { defineStore, type StateTree } from "pinia";
import outboards from "../../config/outboard";
import Outboard from "@/services/classes/Outboard";
import { computed, ref } from "vue";
import { Http } from "@/services/classes/Http";

const consoleColor = ["%cRackStore", "color: #437bad"];

export const useRack = defineStore(
    "rack",
    (): IAppStoreProps & IAppStoreActions => {
        const rackDevices = ref<Outboard[]>([]);
        const availableDevices = ref<CategorizedDeviceList>({});
        const console = useConsole();
        const editor = ref<Outboard | undefined>(undefined);
        const midi = ref<Midi | undefined>(undefined);
        const http = ref<Http | undefined>(undefined);

        // PRIVATE METHODS

        function checkBeforeMoveDevice(list: Outboard[], index: number) {
            if (index < 0) throw new Error(`Position cannot be negative: (${index} of ${list.length})`);
            if (index > list.length) throw new Error(`Position cannot be out of range: (${index} of ${list.length})`);
        }

        function logInitFinished(totalDevices: number, totalCategories: number) {
            window.console.info(
                ...consoleColor,
                `Initialized ${totalDevices} ${totalDevices === 1 ? "device" : "devices"} in ${totalCategories} ${
                    totalCategories === 1 ? "category" : "categories"
                }`
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
            try {
                checkBeforeMoveDevice(fromList, fromIdx);
                checkBeforeMoveDevice(toList, toIdx);
                const removed = fromList.splice(fromIdx, 1)[0];
                if (!removed) throw new Error(`Unable to remove device from ${fromName} list`);
                if (toName !== "rack" && device.category !== toName) removed.category = toName;
                toList.splice(toIdx, 0, removed);
                if (fromName !== toName) window.console.info(...consoleColor, `Device ${device.id} moved to ${toName} list`);
            } catch (e) {
                window.console.error(...consoleColor, (e as Error).message);
                // nothing to do, simply do not move any item
            }
        }

        // PUBLIC METHODS

        function device(id: string) {
            return (
                (rackDevices.value as Outboard[]).find((d: Outboard) => d.id === id) ||
                Object.values(availableDevices.value)
                    .reduce((acc: Outboard[], category) => acc.concat(category), [])
                    .find((d: Outboard) => d.id === id)
            );
        }

        function rackDevice(id: string) {
            return (rackDevices.value as Outboard[]).find((d: Outboard) => d.id === id);
        }

        function storeDevice(id: string) {
            return Object.values(availableDevices.value)
                .reduce((acc: Outboard[], category) => acc.concat(category), [])
                .find((d: Outboard) => d.id === id);
        }

        // const interfaces = computed(() => {
        //     return [...(midi.value ? (midi.value.activeOutputs as Output[]) : []), ...(http.value ? (http.value.activeOutputs as unknown[]) : [])];
        // });

        const totalDevices = computed(() => {
            const inStore = Object.values(availableDevices.value).reduce((sum, category) => sum + category.length, 0);
            return inStore + rackDevices.value.length;
        });

        async function init() {
            try {
                const groups: CategorizedDeviceList = {};
                const sorted = outboards.sort((a: IDeviceConfig, b: IDeviceConfig) =>
                    (a.category || "uncategozized") < (b.category || "uncategozized") && a.label < b.label ? 1 : -1
                );

                sorted.forEach((curDevice) => {
                    if (!curDevice.category) curDevice.category = "uncategorized";
                    const found = device(curDevice.id);
                    if (found) {
                        found.update(curDevice);
                    } else {
                        const outboard = new Outboard(curDevice);
                        if (!((curDevice.category as string) in groups)) {
                            groups[curDevice.category as keyof CategorizedDeviceList] = [outboard];
                        } else {
                            groups[curDevice.category as keyof CategorizedDeviceList].push(outboard);
                        }
                    }
                });

                availableDevices.value = groups;

                logInitFinished(
                    Object.values(availableDevices.value).reduce((sum, category) => sum + category.length, 0),
                    Object.keys(availableDevices.value).length
                );

                midi.value = await Midi.init();
                // http.value = await Http.init();
                return midi.value !== undefined;
            } catch (e) {
                window.console.error(...consoleColor, (e as Error).message);
                return false;
            }
        }

        function moveDeviceToRack(device: Outboard, toIdx: number) {
            try {
                const fromCategory = device.category;
                if (!(fromCategory in availableDevices.value)) throw new Error(`Category ${fromCategory} not available`);
                const fromIdx = availableDevices.value[fromCategory].findIndex((d: Outboard) => d.id === device.id);
                moveDevice(availableDevices.value[fromCategory], fromIdx, rackDevices.value as Outboard[], toIdx, fromCategory, "rack", device);
            } catch (e) {
                window.console.error(...consoleColor, (e as Error).message);
            }
        }

        function reorderCategoryDevices(device: Outboard, fromIdx: number, toIdx: number, fromCategory?: "rack" | keyof CategorizedDeviceList) {
            try {
                let originList: Outboard[] = rackDevices.value as Outboard[];
                if (fromCategory !== "rack") {
                    fromCategory = device.category;
                    if (!(fromCategory in availableDevices.value)) throw new Error(`Category ${fromCategory} not available`);
                    originList = availableDevices.value[fromCategory];
                }
                moveDevice(originList, fromIdx, originList, toIdx, fromCategory, fromCategory, device);
            } catch (e) {
                window.console.error(...consoleColor, (e as Error).message);
            }
        }

        function reorderRackDevices(device: Outboard, fromIdx: number, toIdx: number) {
            reorderCategoryDevices(device, fromIdx, toIdx, "rack");
        }

        function moveDeviceToCategory(
            device: Outboard,
            toCategory: keyof CategorizedDeviceList,
            toIdx: number,
            fromCategory?: "rack" | keyof CategorizedDeviceList
        ) {
            try {
                let originList: Outboard[] = rackDevices.value as Outboard[];
                if (fromCategory !== "rack") {
                    fromCategory = device.category;
                    if (!(fromCategory in availableDevices.value)) throw new Error(`Category ${fromCategory} not available`);
                    originList = availableDevices.value[fromCategory];
                }
                if (!(toCategory in availableDevices.value)) throw new Error(`Category ${toCategory} not available`);
                const destinatioList = availableDevices.value[toCategory];
                const fromIdx = originList.findIndex((d: Outboard) => d.id === device.id);

                moveDevice(originList, fromIdx, destinatioList, toIdx, fromCategory, toCategory, device);
            } catch (e) {
                window.console.error(...consoleColor, (e as Error).message);
            }
        }

        function moveDeviceBackToStore(device: Outboard) {
            const cat = device.category as keyof CategorizedDeviceList;
            if (!(cat in availableDevices.value)) {
                availableDevices.value[cat] = [];
            }
            moveDeviceToCategory(device, cat, availableDevices.value[cat].length, "rack");
        }

        function removeDevice(device: Outboard) {
            if (device.stock) return;

            for (const category in availableDevices.value) {
                const list = availableDevices.value[category];
                const found = list.findIndex((d: IDeviceConfig) => d.id === device.id);
                if (found !== -1) {
                    list.splice(found, 1)[0];
                    break;
                }
            }
        }

        function createNewDevice(): Outboard {
            const name = "device-" + (totalDevices.value + 1);
            const newDevice: IDeviceConfig = {
                backgroundColor: "#000000",
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
            window.console.info(...consoleColor, "Created new Device for editor");

            return new Outboard(newDevice);
        }

        /** Replaces an existing device (in rack or store) with the modified instance. */
        function updateDevice(modified: Outboard) {
            const id = modified.id;
            const inRackIdx = (rackDevices.value as Outboard[]).findIndex((d) => d.id === id);
            if (inRackIdx !== -1) {
                (rackDevices.value as Outboard[]).splice(inRackIdx, 1, new Outboard(modified.toJSON()));
                return;
            }
            for (const category of Object.keys(availableDevices.value)) {
                const list = availableDevices.value[category];
                const idx = list.findIndex((d) => d.id === id);
                if (idx !== -1) {
                    list.splice(idx, 1, new Outboard(modified.toJSON()));
                    return;
                }
            }
        }

        /** Adds a new device to the rack (e.g. after moving from store). */
        function addDeviceToRack(device: Outboard) {
            (rackDevices.value as Outboard[]).push(new Outboard(device.toJSON()));
        }

        /** Adds a new device to the available devices store (sidebar), in the given or device's category. */
        function addDeviceToStore(device: Outboard, category?: keyof CategorizedDeviceList) {
            const cat = category ?? (device.category as keyof CategorizedDeviceList) ?? "uncategorized";
            if (!(cat in availableDevices.value)) {
                availableDevices.value[cat] = [];
            }
            availableDevices.value[cat].push(new Outboard(device.toJSON()));
        }

        /** Clears rack and store state and re-initializes from config (e.g. "Reset all settings"). */
        async function reset(): Promise<boolean> {
            try {
                localStorage.removeItem("rack");
            } catch (_) {
                /* ignore */
            }
            rackDevices.value = [];
            availableDevices.value = {};
            return init();
        }

        return {
            rackDevices,
            availableDevices,
            console,
            editor,
            midi,
            http,
            device,
            rackDevice,
            storeDevice,
            init,
            reset,
            moveDeviceToRack,
            reorderCategoryDevices,
            reorderRackDevices,
            moveDeviceToCategory,
            moveDeviceBackToStore,
            removeDevice,
            createNewDevice,
            updateDevice,
            addDeviceToRack,
            addDeviceToStore,
        };
    },
    {
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

                        const rackDevices = Array.isArray(raw.rackDevices) ? (raw.rackDevices as IDeviceConfig[]).map((d) => new Outboard(d)) : [];

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
    }
);
