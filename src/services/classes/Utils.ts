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

export class Validators {
    public static isColor(str: string | undefined): boolean {
        return str === undefined || str === "transparent" || validator.isHexColor(str.toUpperCase());
    }

    public static isUnsignedInt(value: string | number): boolean {
        return typeof value === "number" ? value > 0 && value.toString().includes(".") : validator.isInt(value, { min: 0 });
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
