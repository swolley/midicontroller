import { describe, expect, it, vi } from "vitest";
import { Listener, MyObjectListener, sealed } from "@/services/decorators";

describe("sealed decorator", () => {
    it("seals the constructor and its prototype", () => {
        @sealed
        class A {
            x = 1;
        }
        expect(Object.isSealed(A)).toBe(true);
        expect(Object.isSealed(A.prototype)).toBe(true);
    });

    it("does not prevent instantiation", () => {
        @sealed
        class B {
            value: number;
            constructor(n: number) {
                this.value = n;
            }
        }
        const b = new B(42);
        expect(b.value).toBe(42);
    });

    it("sealed class can still be used as super class by another sealed class", () => {
        @sealed
        class Base {
            n = 0;
        }
        @sealed
        class Derived extends Base {
            m = 1;
        }
        const d = new Derived();
        expect(d.n).toBe(0);
        expect(d.m).toBe(1);
    });
});

describe("Listener decorator", () => {
    it("calls onObjectCreation when an instance is created", () => {
        const onObjectCreation = vi.fn();
        @Listener({ onObjectCreation })
        class C {
            x: number;
            constructor(x: number) {
                this.x = x;
            }
        }
        const c = new C(10);
        expect(c.x).toBe(10);
        expect(onObjectCreation).toHaveBeenCalledTimes(1);
        expect(onObjectCreation).toHaveBeenCalledWith(c);
    });

    it("MyObjectListener logs created instance", () => {
        const logSpy = vi.spyOn(console, "info").mockImplementation(() => {});
        @Listener(new MyObjectListener())
        class D {
            id = 1;
        }
        const d = new D();
        expect(d.id).toBe(1);
        expect(logSpy).toHaveBeenCalledWith("Object created:", expect.any(String));
        logSpy.mockRestore();
    });
});
