export default class Color {
    private _r: number;
    private _g: number;
    private _b: number;
    private _a: number;

    public constructor(r?: number, g?: number, b?: number, a?: number) {
        this._r = r !== undefined ? r : Color.random();
        this._g = g !== undefined ? g : Color.random();
        this._b = b !== undefined ? b : Color.random();
        this._a = a !== undefined && a !== null ? a : 100;
    }

    public get r(): number {
        return this._r;
    }
    public set r(value: number) {
        if (!Color.validateValue(value, 255)) Color.throwInvalidValueError();
        this._r = value;
    }

    public get g(): number {
        return this._g;
    }
    public set g(value: number) {
        if (!Color.validateValue(value, 255)) Color.throwInvalidValueError();
        this._g = value;
    }

    public get b(): number {
        return this._b;
    }
    public set b(value: number) {
        if (!Color.validateValue(value, 255)) Color.throwInvalidValueError();
        this._b = value;
    }

    public get a(): number {
        return this._a;
    }
    public set a(a: number) {
        if (!Color.validateValue(a, 100)) Color.throwInvalidValueError();
        this._a = a;
    }

    private static validateValue(value: number, max: number): boolean {
        return Number.isInteger(value) && value >= 0 && value <= max && !Number.isNaN(value);
    }

    private static throwInvalidValueError() {
        throw new Error("rbga values must be between 0 and 255 and a value between 0 and 100");
    }

    private static random(): number {
        return Math.floor(Math.random() * 255);
    }

    private static componentToHex(c: number): string {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    public static createFromHex(hex: string): Color {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
        if (!result) throw new Error(`${hex} is not a valid hex value`);
        const aHex = result[4] ? parseInt(result[4], 16) : undefined;
        const a = aHex !== undefined ? Math.round((aHex / 255) * 100) : 100;
        return new Color(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), a);
    }

    /** Parse rgba(r,g,b,a) or rgb(r,g,b) from persisted/CSS strings. Alpha: 0–1 (CSS) or 0–100 (legacy). */
    public static createFromRgb(rgb: string): Color {
        const rgbaMatch = /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/i.exec(rgb);
        if (!rgbaMatch) throw new Error(`${rgb} is not a valid rgb/rgba value`);
        const r = parseInt(rgbaMatch[1], 10);
        const g = parseInt(rgbaMatch[2], 10);
        const b = parseInt(rgbaMatch[3], 10);
        const aRaw = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 100;
        const a = aRaw <= 1 ? Math.round(aRaw * 100) : Math.round(aRaw);
        return new Color(r, g, b, a);
    }

    public static isValidHex(hex: string): boolean {
        return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) !== null;
    }

    public isTransparent(): boolean {
        return this._a === 0;
    }

    public toRgb(addTransparency = true): string {
        return addTransparency ? `rgba(${this._r},${this._g},${this._b},${this._a})` : `rgb(${this._r},${this._g},${this._b})`;
    }

    public toHex(addTransparency = true): string {
        return (
            "#" +
            Color.componentToHex(this._r) +
            Color.componentToHex(this._g) +
            Color.componentToHex(this._b) +
            (addTransparency ? Color.componentToHex((this._a / 100) * 255) : "")
        );
    }

    public toString() {
        return this.toRgb();
    }

    public toJSON() {
        return this.toHex();
    }
}
