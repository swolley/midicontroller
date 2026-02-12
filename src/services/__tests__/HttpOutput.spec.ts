import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HttpOutput from "@/services/classes/HttpOutput";

describe("HttpOutput", () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("throws when baseUrl is invalid", () => {
        expect(
            () =>
                new HttpOutput({
                    baseUrl: "not-a-valid-url",
                    auth: { type: "bearer", token: "x" },
                })
        ).toThrow('HttpOutput: invalid baseUrl "not-a-valid-url"');
    });

    it("constructs with required config and sets id/name from baseUrl when not provided", () => {
        const out = new HttpOutput({
            baseUrl: "https://server.example/api",
            auth: { type: "bearer", token: "secret" },
        });
        expect(out.id).toBe("http-https://server.example/api");
        expect(out.name).toBe("https://server.example/api");
        expect(out.manufacturer).toBe("HTTP");
    });

    it("constructs with optional id and name", () => {
        const out = new HttpOutput({
            baseUrl: "https://server.example",
            id: "my-id",
            name: "My Server",
            auth: { type: "apikey", key: "key123" },
        });
        expect(out.id).toBe("my-id");
        expect(out.name).toBe("My Server");
    });

    it("strips trailing slash from baseUrl", () => {
        const out = new HttpOutput({
            baseUrl: "https://server.example/",
            auth: { type: "bearer", token: "t" },
        });
        out.sendControlChange(1, 127, { channels: 1 });
        expect(fetchMock).toHaveBeenCalledWith(
            "https://server.example/midi/control-change",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    "Content-Type": "application/json",
                    Authorization: "Bearer t",
                }),
                body: JSON.stringify({ channel: 1, note: 1, velocity: 127 }),
            })
        );
    });

    it("sendControlChange sends POST with Bearer auth", async () => {
        const out = new HttpOutput({
            baseUrl: "https://api.test",
            auth: { type: "bearer", token: "jwt-token" },
        });
        out.sendControlChange(64, 100, { channels: 2 });
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.test/midi/control-change",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    Authorization: "Bearer jwt-token",
                    "Content-Type": "application/json",
                }),
                body: JSON.stringify({ channel: 2, note: 64, velocity: 100 }),
            })
        );
    });

    it("sendControlChange sends POST with X-API-Key when auth type is apikey", async () => {
        const out = new HttpOutput({
            baseUrl: "https://api.test",
            auth: { type: "apikey", key: "my-api-key" },
        });
        out.sendControlChange(0, 0, { channels: 1 });
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.test/midi/control-change",
            expect.objectContaining({
                headers: expect.objectContaining({
                    "X-API-Key": "my-api-key",
                }),
            })
        );
    });

    it("sendProgramChange sends POST with channel and note", async () => {
        const out = new HttpOutput({
            baseUrl: "https://api.test",
            auth: { type: "bearer", token: "t" },
        });
        out.sendProgramChange(5, { channels: 3 });
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.test/midi/program-change",
            expect.objectContaining({
                body: JSON.stringify({ channel: 3, note: 5 }),
            })
        );
    });

    it("sendControlChange with channels array sends array in body", async () => {
        const out = new HttpOutput({
            baseUrl: "https://api.test",
            auth: { type: "bearer", token: "t" },
        });
        out.sendControlChange(10, 50, { channels: [1, 2] });
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.test/midi/control-change",
            expect.objectContaining({
                body: JSON.stringify({ channel: [1, 2], note: 10, velocity: 50 }),
            })
        );
    });
});
