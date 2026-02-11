import type { ChannelRange, IDeviceConfig, IDeviceControllers, IControllerConfigs, RotaryStyle } from "@/services/types/devices";
import { ObjectUtils, Validators } from "@/services/classes/Utils";
import Color from "@/services/classes/Color";
// import { sealed, MyObjectListener, Listener } from "@/services/types/decorators";
import type { Output } from "webmidi";

const notValidError = "Not a valid color";

// @sealed
// @Listener(new MyObjectListener())
export default class Outboard implements IDeviceConfig {
    private _id: string;
    private _label: string;
    private _backgroundColor: Color;
    private _panelColor: Color;
    private _borderColor: Color;
    private _borderSize = 0;
    private _hasMultiSelection = false;
    private _category: string;
    private _style: RotaryStyle = "dark";
    private _logo?: string;
    private _controllers: IDeviceControllers;
    private _channel: ChannelRange = 1;
    private _output?: Output;
    private _originalConfigs: IDeviceConfig;
    readonly stock: boolean;
    readonly key: string;

    public constructor(config: IDeviceConfig) {
        this._originalConfigs = Object.freeze(ObjectUtils.clone<IDeviceConfig>(config));
        this.key = this._originalConfigs.id + new Date().getTime().toString();
        this._id = this._originalConfigs.id;
        this._label = this._originalConfigs.label;
        this._backgroundColor = Outboard.parseColor(this._originalConfigs.backgroundColor);
        this._panelColor = Outboard.parseColor(this._originalConfigs.panelColor);
        this._borderColor = Outboard.parseColor(this._originalConfigs.borderColor);
        if (this._originalConfigs.borderSize) this._borderSize = this._originalConfigs.borderSize;
        this.stock = this._originalConfigs.stock;
        this._logo = this._originalConfigs.logo;
        for (const type in this._originalConfigs.controllers) {
            for (const controller of this._originalConfigs.controllers[type as keyof IDeviceControllers]) {
                controller.minValue = controller.minValue || 0;
                controller.maxValue = controller.maxValue || 127;
            }
        }
        this._controllers = this._originalConfigs.controllers;
        this._category = this._originalConfigs.category || "uncategorized";
        if (this._originalConfigs.style) this._style = this._originalConfigs.style;
        // if (config.hasMultiSelection) this.hasMultiSelection = config.hasMultiSelection;
        // {
        //     lcds: config.controllers.lcds.map((controller) => Outboard.createController(controller)),
        //     toggles: config.controllers.toggles.map((controller) => Outboard.createController(controller)),
        //     rotaries: config.controllers.rotaries.map((controller) => Outboard.createController(controller)),
        // };
    }

    public update(config: IDeviceConfig) {
        const newOriginalConfigs = Object.freeze(ObjectUtils.clone<IDeviceConfig>(config));
        for (const type in newOriginalConfigs.controllers) {
            for (const controller of newOriginalConfigs.controllers[type as keyof IDeviceControllers]) {
                controller.minValue = controller.minValue || 0;
                controller.maxValue = controller.maxValue || 127;
                const oldController = this.getController(controller.label);
                if (oldController) {
                    controller.value = oldController.value;
                }
            }
        }
        this._originalConfigs = newOriginalConfigs;
        this._label = this.originalConfigs.label;
        this._backgroundColor = Outboard.parseColor(this.originalConfigs.backgroundColor);
        this._panelColor = Outboard.parseColor(this.originalConfigs.panelColor);
        this._borderColor = Outboard.parseColor(this.originalConfigs.borderColor);
        if (this.originalConfigs.borderSize) this._borderSize = this.originalConfigs.borderSize;
        this._logo = this._originalConfigs.logo;
        this._controllers = this.originalConfigs.controllers;
        this._category = this.originalConfigs.category || "uncategorized";
        if (this.originalConfigs.style) this._style = this.originalConfigs.style;
        // if (config.hasMultiSelection) this.hasMultiSelection = config.hasMultiSelection;
        // {
        //     lcds: config.controllers.lcds.map((controller) => Outboard.createController(controller)),
        //     toggles: config.controllers.toggles.map((controller) => Outboard.createController(controller)),
        //     rotaries: config.controllers.rotaries.map((controller) => Outboard.createController(controller)),
        // };
    }

    public static parseColor(color: Color | string | undefined | null): Color {
        if (color == null || color === "transparent") return new Color(0, 0, 0, 0);
        if (color instanceof Color) return color;
        if (typeof color === "object" && "r" in color && "g" in color && "b" in color) {
            const o = color as { r: number; g: number; b: number; a?: number };
            return new Color(o.r, o.g, o.b, o.a);
        }
        if (typeof color === "string") {
            try {
                return Color.createFromHex(color);
            } catch {
                try {
                    return Color.createFromRgb(color);
                } catch {
                    return new Color(0, 0, 0, 0);
                }
            }
        }
        return new Color(0, 0, 0, 0);
    }

    private checkStock() {
        if (this.stock) throw new Error("Stock Device cannot be modified");
    }

    get id(): string {
        return this._id;
    }

    /** the device's unique identifier */
    set id(id: string) {
        this.checkStock();
        this._id = id;
    }

    get label(): string {
        return this._label;
    }

    /** the device's label */
    set label(label: string) {
        this.checkStock();
        this._label = label;
    }

    get backgroundColor(): Color {
        return this._backgroundColor;
    }

    /** the device's background color */
    set backgroundColor(color: Color | string) {
        this.checkStock();
        this._backgroundColor = Outboard.parseColor(color);
    }

    get panelColor(): Color {
        return this._panelColor;
    }

    /** the device's panel color */
    set panelColor(color: Color | string) {
        this.checkStock();
        this._panelColor = Outboard.parseColor(color);
    }

    get borderColor(): Color {
        return this._borderColor;
    }

    /** the device's border color */
    set borderColor(color: Color | string) {
        this.checkStock();
        this._borderColor = Outboard.parseColor(color);
    }

    get borderSize(): number {
        return this._borderSize;
    }

    /** the device's border size */
    set borderSize(size: number) {
        this.checkStock();
        if (size < 0) throw new Error(notValidError);
        this._borderSize = size;
    }

    get hasMultiSelection(): boolean {
        return this._hasMultiSelection;
    }

    /** whether the device supports multi-selection */
    set hasMultiSelection(value: boolean) {
        this.checkStock();
        this._hasMultiSelection = value;
    }

    get category(): string {
        return this._category;
    }

    /** the device's category */
    set category(value: string | undefined) {
        this.checkStock();
        if (value && value.length) throw new Error(notValidError);
        this._category = value !== undefined && value.length > 0 ? value : "uncategorized";
    }

    get style(): RotaryStyle {
        return this._style;
    }

    /** the device's rotary style */
    set style(value: RotaryStyle) {
        this.checkStock();
        this._style = value;
    }

    get logo(): string | undefined {
        return this._logo;
    }

    /** the device's logo (data URL e.g. data:image/png;base64,...). */
    set logo(value: string | undefined) {
        this.checkStock();
        this._logo = value;
    }

    get channel(): ChannelRange {
        return this._channel;
    }

    /** the device's MIDI channel  */
    set channel(channel: ChannelRange) {
        this.checkStock();
        this._channel = channel;
    }

    get outputInterface(): Output | undefined {
        return this._output;
    }

    /** the device's MIDI output interface */
    set outputInterface(output: Output | undefined) {
        this.checkStock();
        this._output = output;
    }

    /* the device's list of controllers */
    get controllers(): IDeviceControllers {
        return this._controllers;
    }

    get originalConfigs(): IDeviceConfig {
        return this._originalConfigs;
    }

    private getControllerList(controller: IControllerConfigs) {
        switch (controller.type) {
            case "LCD":
                return this.controllers.lcds;
            case "TOGGLE":
                return this.controllers.toggles;
            case "ROTARY":
                return this.controllers.rotaries.filter((r) => r.type === "ROTARY");
            case "STEP":
                return this.controllers.rotaries.filter((r) => r.type === "STEP");
        }
    }

    public addController(controller: IControllerConfigs) {
        this.checkStock();
        const list: IControllerConfigs[] = this.getControllerList(controller);
        const foundIdx = list.findIndex((c) => c.label === controller.label);
        if (foundIdx !== -1) throw new Error("Controller already exists");

        list.push(controller);
    }

    public deleteController(controller: IControllerConfigs) {
        this.checkStock();
        const list: IControllerConfigs[] = this.getControllerList(controller);
        const foundIdx = this.controllers.lcds.findIndex((c) => c.label === controller.label);
        if (foundIdx === -1) throw new Error("Controller not found");

        list.splice(foundIdx, 1);
    }

    public getController(label: string): IControllerConfigs | undefined {
        for (const type in this.controllers) {
            for (const controller of this.controllers[type as keyof IDeviceControllers]) {
                if (controller.label === label) return controller;
            }
        }

        return undefined;
    }

    // private static createController(controller: IControllerConfigs) {
    //     return controller;
    // }

    // public getDeviceConfigs(): IDeviceConfig {
    //     return JSON.parse(
    //         JSON.stringify({
    //             id: this.id,
    //             // channel: this.channel,
    //             label: this.label,
    //             backgroundColor: this.backgroundColor,
    //             panelColor: this.panelColor,
    //             borderColor: this.borderColor,
    //             borderSize: this.borderSize,
    //             // hasMultiSelection: this.hasMultiSelection,
    //             controllers: this.controllers,
    //             style: this.style,
    //             stock: this.stock,
    //             category: this.category,
    //         })
    //     ) as IDeviceConfig;
    // }

    /** Plain object for JSON serialization (JS has no built-in class serialize like PHP). */
    toJSON(): IDeviceConfig {
        return {
            id: this.id,
            label: this.label,
            backgroundColor: typeof this.backgroundColor === "string" ? this.backgroundColor : this.backgroundColor.toHex(),
            panelColor: typeof this.panelColor === "string" ? this.panelColor : this.panelColor.toHex(),
            borderColor: typeof this.borderColor === "string" ? this.borderColor : this.borderColor.toHex(),
            borderSize: this.borderSize,
            style: this.style,
            stock: this.stock,
            category: this.category,
            controllers: this.controllers,
            logo: this.logo,
        };
    }
}
