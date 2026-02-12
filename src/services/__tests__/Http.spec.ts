import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IDeviceConfig } from "@/services/types/devices";
import { Http } from "@/services/classes/Http";

const mockDevice: IDeviceConfig = {
    id: "dev-1",
    label: "Test Device",
    backgroundColor: "#000",
    stock: true,
    controllers: { lcds: [], toggles: [], rotaries: [] },
};

describe("Http", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("init returns undefined when endpoints array is empty", async () => {
        const result = await Http.init({ endpoints: [], auth: { type: "bearer", token: "x" } });
        expect(result).toBeUndefined();
    });

    it("init returns Http instance with one endpoint", async () => {
        const result = await Http.init({
            endpoints: [{ baseUrl: "https://server.test", name: "Server" }],
            auth: { type: "bearer", token: "t" },
        });
        expect(result).toBeDefined();
        expect(result?.outputs).toHaveLength(1);
        expect(result?.activeOutputs).toHaveLength(1);
        expect(result?.outputs[0].name).toBe("Server");
    });

    it("init returns Http with multiple endpoints", async () => {
        const result = await Http.init({
            endpoints: [
                { baseUrl: "https://a.test", id: "a" },
                { baseUrl: "https://b.test", id: "b" },
            ],
            auth: { type: "apikey", key: "k" },
        });
        expect(result?.outputs).toHaveLength(2);
        expect(result?.outputs[0].id).toBe("a");
        expect(result?.outputs[1].id).toBe("b");
    });

    it("send with output index 0 calls fetch with control-change payload", async () => {
        const fetchMock = vi.mocked(fetch);
        const http = await Http.init({
            endpoints: [{ baseUrl: "https://x.test" }],
            auth: { type: "bearer", token: "t" },
        });
        if (!http) throw new Error("Http init failed");

        const ok = http.send(0, 1, "controlchange", 64, 127, mockDevice);
        expect(ok).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith(
            "https://x.test/midi/control-change",
            expect.objectContaining({
                body: JSON.stringify({ channel: 1, note: 64, velocity: 127 }),
            })
        );
    });

    it("send with invalid output index returns false", async () => {
        const http = await Http.init({
            endpoints: [{ baseUrl: "https://x.test" }],
            auth: { type: "bearer", token: "t" },
        });
        if (!http) throw new Error("Http init failed");

        const ok = http.send(99, 1, "controlchange", 0, 0, mockDevice);
        expect(ok).toBe(false);
    });

    it("send with unhandled messageType returns false", async () => {
        const http = await Http.init({
            endpoints: [{ baseUrl: "https://x.test" }],
            auth: { type: "bearer", token: "t" },
        });
        if (!http) throw new Error("Http init failed");

        const ok = http.send(0, 1, "noteon" as "controlchange", 60, 100, mockDevice);
        expect(ok).toBe(false);
    });

    it("disabled list filters activeOutputs", async () => {
        const result = await Http.init(
            {
                endpoints: [
                    { baseUrl: "https://a.test", id: "a" },
                    { baseUrl: "https://b.test", id: "b" },
                ],
                auth: { type: "bearer", token: "t" },
            },
            ["b"]
        );
        expect(result?.outputs).toHaveLength(2);
        expect(result?.activeOutputs).toHaveLength(1);
        expect(result?.activeOutputs[0].id).toBe("a");
    });
});
