import type { Input, Output } from "webmidi";
import type { ChannelRange } from "@/services/types/devices";

export default abstract class AbstractComunicator {
    protected _inputs: Input[] = [];
    protected _outputs: Output[] = [];
    protected _disabled: string[] = [];

    public constructor(inputs: Input[], outputs: Output[], disabled: string[] = []) {
        this._inputs = inputs;
        this._outputs = outputs;
        this._disabled = disabled;
    }

    get inputs() {
        return this._inputs;
    }

    get activeInputs() {
        return this._inputs.filter((i) => !this._disabled.includes(i.id));
    }

    get outputs() {
        return this._outputs;
    }

    get activeOutputs() {
        return this._outputs.filter((i) => !this._disabled.includes(i.id));
    }

    // addHttpInput() {}
    // addHttpOutput() {}

    public isActive(id: string) {
        return !this._disabled.includes(id);
    }

    public enable(id: string) {
        if (this._inputs.findIndex((i) => i.id === id) != -1 || (this._outputs.findIndex((i) => i.id === id) != -1 && this._disabled.includes(id))) {
            this._disabled = this._disabled.filter((a) => a !== id);
            return true;
        }

        return false;
    }

    public disable(id: string) {
        if (this._inputs.findIndex((i) => i.id === id) != -1 || (this._outputs.findIndex((i) => i.id === id) != -1 && !this._disabled.includes(id))) {
            this._disabled.push(id);
            return true;
        }

        return false;
    }

    /**
     * {@inheritDoc devices.d#IComunicatorInterface.getPrintableOctects}
     */
    protected static getPrintableOctects(messageType: number, channel: ChannelRange, note: number, velocity: number, base = 10) {
        let octects = [
            AbstractComunicator.convertBase(((messageType << 4) + (channel - 1)).toString(), 10, base),
            AbstractComunicator.convertBase(note.toString(), 10, base),
            AbstractComunicator.convertBase(velocity.toString(), 10, base),
        ];

        switch (base) {
            case 2:
                octects = octects.map((octect) => ("00000000" + octect).substring(-8));
                break;
            case 10:
                octects = octects.map((octect) => ("000" + octect).substring(-3));
                break;
            case 16:
                octects = octects.map((octect) => ("00" + octect).substring(-2));
                break;
        }

        return octects.join(" ");
    }

    // getNote(outboard, controller) {
    //     try {
    //         return outboard.getController(controller);
    //     } catch (e) {
    //         console.error(`No "${controller}" controller configured on "${outboard.name}" device`);
    //     }
    // }

    protected static convertBase(value: string, from_base: number, to_base: number) {
        const range = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/".split("");
        const from_range = range.slice(0, from_base);
        const to_range = range.slice(0, to_base);

        let dec_value = value
            .split("")
            .reverse()
            .reduce((carry: number, digit: string, index: number) => {
                if (from_range.indexOf(digit) === -1) throw new Error("Invalid digit `" + digit + "` for base " + from_base + ".");
                return carry + from_range.indexOf(digit) * Math.pow(from_base, index);
            }, 0);

        let new_value = "";
        while (dec_value > 0) {
            new_value = to_range[dec_value % to_base] + new_value;
            dec_value = (dec_value - (dec_value % to_base)) / to_base;
        }
        return new_value || "0";
    }
}
