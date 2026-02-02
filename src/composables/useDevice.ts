import type Outboard from "@/services/classes/Outboard";
import type { ILcdControllerConfigs, IMessageControllerConfigs } from "@/services/types/devices";
import { reactive } from "vue";

export function useDevice(device: Outboard) {
    const currentDevice = reactive<Outboard>(device) as Outboard;
    let hasPatch = false;
    const lcds: ILcdControllerConfigs[] = currentDevice.controllers.lcds;
    const rotaries: IMessageControllerConfigs[] = currentDevice.controllers.rotaries;
    const toggles: IMessageControllerConfigs[] = currentDevice.controllers.toggles;

    for (const controller of currentDevice.controllers.lcds) {
        if (controller.message === "programchange") {
            hasPatch = true;
            break;
            // lcds.push(c as ILcdControllerConfigs);
        } /* else if (c.type === "LCD") {
            lcds.push(c as ILcdControllerConfigs);
        } else if (c.type === "TOGGLE") {
            toggles.push(c as IMessageControllerConfigs);
        } else {
            rotaries.push(c as IMessageControllerConfigs);
        }*/
    }

    return {
        hasPatch,
        lcds,
        rotaries,
        toggles,
        currentDevice,
    };
}
