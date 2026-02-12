import { describe, expect, it, vi } from "vitest";
import type { ChannelRange, IDeviceConfig, IOutputPort, MessageType } from "@/services/types/devices";
import AbstractComunicator from "@/services/classes/AbstractComunicator";

/** Minimal IOutputPort mock for testing. */
function createMockOutput(id: string, name: string): IOutputPort {
    return {
        id,
        name,
        manufacturer: "Test",
        sendControlChange: vi.fn(),
        sendProgramChange: vi.fn(),
    };
}

/** Concrete subclass to test the abstract class. */
class TestComunicator extends AbstractComunicator {
    public send(
        _output: IOutputPort | number,
        _channel: ChannelRange,
        _messageType: MessageType,
        _note: number,
        _velocity: number,
        _selectedOutboard: IDeviceConfig
    ): boolean {
        return true;
    }

    /** Expose protected static for testing. */
    public static testGetPrintableOctects(
        messageType: number,
        channel: ChannelRange,
        note: number,
        velocity: number,
        base?: number
    ): string {
        return AbstractComunicator.getPrintableOctects(messageType, channel, note, velocity, base);
    }
}

describe("AbstractComunicator", () => {
    it("exposes outputs and activeOutputs from constructor", () => {
        const out1 = createMockOutput("out-1", "Output 1");
        const out2 = createMockOutput("out-2", "Output 2");
        const c = new TestComunicator([out1, out2], []);
        expect(c.outputs).toHaveLength(2);
        expect(c.activeOutputs).toHaveLength(2);
        expect(c.outputs[0].id).toBe("out-1");
        expect(c.outputs[1].name).toBe("Output 2");
    });

    it("filters activeOutputs by disabled list", () => {
        const out1 = createMockOutput("out-1", "Output 1");
        const out2 = createMockOutput("out-2", "Output 2");
        const c = new TestComunicator([out1, out2], ["out-2"]);
        expect(c.outputs).toHaveLength(2);
        expect(c.activeOutputs).toHaveLength(1);
        expect(c.activeOutputs[0].id).toBe("out-1");
    });

    it("isActive returns true when id is not disabled", () => {
        const out1 = createMockOutput("out-1", "Output 1");
        const c = new TestComunicator([out1], []);
        expect(c.isActive("out-1")).toBe(true);
    });

    it("isActive returns false when id is in disabled list", () => {
        const out1 = createMockOutput("out-1", "Output 1");
        const c = new TestComunicator([out1], ["out-1"]);
        expect(c.isActive("out-1")).toBe(false);
    });

    it("disable removes id from activeOutputs and returns true when id is an output", () => {
        const out1 = createMockOutput("out-1", "Output 1");
        const c = new TestComunicator([out1], []);
        expect(c.activeOutputs).toHaveLength(1);
        expect(c.disable("out-1")).toBe(true);
        expect(c.activeOutputs).toHaveLength(0);
        expect(c.isActive("out-1")).toBe(false);
    });

    it("enable re-adds id and returns true when id was disabled", () => {
        const out1 = createMockOutput("out-1", "Output 1");
        const c = new TestComunicator([out1], ["out-1"]);
        expect(c.activeOutputs).toHaveLength(0);
        expect(c.enable("out-1")).toBe(true);
        expect(c.activeOutputs).toHaveLength(1);
        expect(c.isActive("out-1")).toBe(true);
    });

    it("disable returns false when id is not in outputs or inputs", () => {
        const out1 = createMockOutput("out-1", "Output 1");
        const c = new TestComunicator([out1], []);
        expect(c.disable("unknown-id")).toBe(false);
    });

    it("enable returns false when id is not in outputs or inputs", () => {
        const out1 = createMockOutput("out-1", "Output 1");
        const c = new TestComunicator([out1], []);
        expect(c.enable("unknown-id")).toBe(false);
    });

    it("inputs and activeInputs are empty when no inputs passed", () => {
        const out1 = createMockOutput("out-1", "Output 1");
        const c = new TestComunicator([out1], []);
        expect(c.inputs).toHaveLength(0);
        expect(c.activeInputs).toHaveLength(0);
    });

    it("getPrintableOctects formats status, note, velocity in base 2", () => {
        const s = TestComunicator.testGetPrintableOctects(0x0b, 1, 64, 127, 2);
        expect(s).toMatch(/^[01 ]+$/);
        expect(s.split(" ")).toHaveLength(3);
    });

    it("getPrintableOctects formats in base 10 with zero-padding", () => {
        const s = TestComunicator.testGetPrintableOctects(0x0b, 1, 0, 0, 10);
        expect(s).toMatch(/^\d+ \d+ \d+$/);
    });

    it("getPrintableOctects formats in base 16", () => {
        const s = TestComunicator.testGetPrintableOctects(0x0b, 16, 127, 127, 16);
        expect(s).toMatch(/^[0-9a-fA-F ]+$/);
    });
});
