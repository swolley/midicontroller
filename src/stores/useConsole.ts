import type { IConsoleLog, IConsole, LogType } from "@/services/types/devices";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useConsole = defineStore("console", (): IConsole => {
    const logs = ref<IConsoleLog[]>([])
    
    Object.keys(window.console).forEach((method) => {
        if (isLogType(method)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-console
            const original = window.console[method as keyof Console] as (...args: any[]) => void; /*.bind(console)*/
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-console
            (window.console[method as keyof Console] as (...args: any[]) => void) = (...args: any[]) => {
                original(...args);
                log(method as LogType, args);
            };
        }
    });
    
    function isLogType(arg: string): arg is LogType {
        return ["info", "warn", "error"].some((element) => element === arg);
    }
    
    function log(type: LogType, contents: unknown[]) {
        const slicedLogs = [...logs.value.slice(0, 19)];
        slicedLogs.unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            type: type,
            timestamp: new Date(),
            message: contents.map((text) => (typeof text === "object" ? JSON.stringify(text) : text)).join(" "),
        });

        logs.value = slicedLogs;
    }

    return {
        logs,
    };
});
