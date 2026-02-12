import validator from "validator";

/**
 * Returns the total offset of an element relative to the document.
 * @param el - The element to get the offset of.
 * @returns An object with the top and left offset values.
 */
interface Offset {
    top: number;
    left: number;
}

export function getOffset(el: HTMLElement | null): Offset {
    let totalOffsetLeft = 0;
    let totalOffsetTop = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        totalOffsetLeft += el.offsetLeft - el.scrollLeft;
        totalOffsetTop += el.offsetTop - el.scrollTop;
        el = el.offsetParent as HTMLElement | null;
    }
    return { top: totalOffsetTop, left: totalOffsetLeft };
}

export class StringUtils {
    /**
     * Converts the first character of a string to uppercase.
     * @param str The input string.
     * @returns The input string with the first character converted to uppercase.
     */
    public static ucFirst(str = ""): string {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

/** Validation helpers using the validator library. */
export class Validators {
    /** Hex color (#RGB, #RRGGBB) or "transparent". */
    public static isColor(str: string | undefined): boolean {
        return str === undefined || str === "transparent" || validator.isHexColor(str.toUpperCase());
    }

    /** Non-negative integer (string or number). */
    public static isUnsignedInt(value: string | number): boolean {
        if (typeof value === "number") {
            return Number.isInteger(value) && value >= 0 && !Number.isNaN(value);
        }
        return validator.isInt(value, { min: 0 });
    }

    /** MIDI channel 1–16. */
    public static isMidiChannel(value: string | number): boolean {
        const n = typeof value === "number" ? value : parseInt(value, 10);
        return Number.isInteger(n) && n >= 1 && n <= 16 && !Number.isNaN(n);
    }

    /** MIDI note or controller number 0–127. */
    public static isMidiNote(value: string | number): boolean {
        const n = typeof value === "number" ? value : parseInt(value, 10);
        return Number.isInteger(n) && n >= 0 && n <= 127 && !Number.isNaN(n);
    }

    /** MIDI velocity or value 0–127. */
    public static isMidiVelocity(value: string | number): boolean {
        return Validators.isMidiNote(value);
    }

    /** Valid URL (http, https, or allowLocal for relative URLs in dev). Allows localhost (no TLD). */
    public static isUrl(str: string, options?: { allowLocal?: boolean }): boolean {
        if (!str || typeof str !== "string") return false;
        const trimmed = str.trim();
        if (options?.allowLocal && (trimmed.startsWith("/") || trimmed.startsWith("./"))) return true;
        return validator.isURL(trimmed, {
            require_protocol: true,
            protocols: ["http", "https"],
            require_tld: false,
        });
    }
}

export class ObjectUtils {
    public static clone<T>(obj: T): T {
        if (obj === null || obj === undefined) return obj;
        try {
            return JSON.parse(JSON.stringify(obj, (key, value) => (typeof value !== "function" ? value : undefined)));
        } catch (e) {
            console.error("Error cloning object:", e);
            throw e;
        }
    }
}
