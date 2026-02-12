import { describe, expect, it, vi } from "vitest";
import Midi from "@/services/classes/Midi";
import Outboard from "@/services/classes/Outboard";
import type { IOutputPort } from "@/services/types/devices";

/**
 * Midi implements IComunicator and uses WebMidi for real I/O.
 * In jsdom there is no WebMIDI, so Midi.init() returns undefined.
 * We test Midi.send() and enable/disable by constructing Midi with mock IOutputPorts
 * (possible because AbstractComunicator accepts IOutputPort[]).
 */

function createMockOutput(id: string, name: string): IOutputPort {
    return {
        id,
        name,
        manufacturer: "Test",
        sendControlChange: vi.fn(),
        sendProgramChange: vi.fn(),
    };
}

const mockDeviceConfig = {
    id: "testOutboard",
    label: "Test Outboard",
    backgroundColor: "#000000",
    panelColor: "#FFFFFF",
    borderColor: "#CCCCCC",
    stock: true,
    controllers: { lcds: [], toggles: [], rotaries: [] },
};

describe("Midi_class", () => {
    it("init returns undefined when WebMIDI is not available (e.g. jsdom)", async () => {
        const midi = await Midi.init();
        expect(midi).toBeUndefined();
    });

    it("send(controlchange) calls sendControlChange on the output", () => {
        const output = createMockOutput("out-1", "Output 1");
        const midi = new Midi([output], []);
        const outboard = new Outboard(mockDeviceConfig);

        const result = midi.send(output, 1, "controlchange", 64, 127, outboard);

        expect(result).toBe(true);
        expect(output.sendControlChange).toHaveBeenCalledWith(64, 127, { channels: 1 });
    });

    it("send(programchange) calls sendProgramChange on the output", () => {
        const output = createMockOutput("out-1", "Output 1");
        const midi = new Midi([output], []);
        const outboard = new Outboard(mockDeviceConfig);

        const result = midi.send(output, 1, "programchange", 5, 0, outboard);

        expect(result).toBe(true);
        expect(output.sendProgramChange).toHaveBeenCalledWith(5, { channels: 1 });
    });

    it("send with output index uses outputs[index]", () => {
        const output = createMockOutput("out-1", "Output 1");
        const midi = new Midi([output], []);

        const result = midi.send(0, 1, "controlchange", 1, 127, new Outboard(mockDeviceConfig));

        expect(result).toBe(true);
        expect(output.sendControlChange).toHaveBeenCalledWith(1, 127, { channels: 1 });
    });

    it("send throws when messageType is not handled", () => {
        const output = createMockOutput("out-1", "Output 1");
        const midi = new Midi([output], []);
        const outboard = new Outboard(mockDeviceConfig);

        expect(() => midi.send(output, 1, "noteon" as "controlchange", 1, 127, outboard)).toThrow(
            "MessageType noteon not handled"
        );
    });

    it("enable/disable and isActive work with output ids", () => {
        const out1 = createMockOutput("out-1", "Output 1");
        const midi = new Midi([out1], []);

        expect(midi.isActive("out-1")).toBe(true);
        expect(midi.disable("out-1")).toBe(true);
        expect(midi.isActive("out-1")).toBe(false);
        expect(midi.activeOutputs).toHaveLength(0);
        expect(midi.enable("out-1")).toBe(true);
        expect(midi.isActive("out-1")).toBe(true);
        expect(midi.activeOutputs).toHaveLength(1);
    });
});
