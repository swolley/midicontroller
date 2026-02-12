import type { HttpComunicatorAuth, IOutputPort, IOutputPortOptions } from "@/services/types/devices";
import { HttpAuthTypeEnum } from "@/services/types/enums";
import { Validators } from "@/services/classes/Utils";
import { sealed } from "@/services/decorators";

const REQUEST_TIMEOUT_MS = 10000;

export interface HttpOutputConfig {
    baseUrl: string;
    id?: string;
    name?: string;
    auth: HttpComunicatorAuth;
}

/**
 * Remote MIDI output: implements IOutputPort by sending control-change and
 * program-change over HTTPS with authentication. Use only with HTTPS in production.
 */
@sealed
export default class HttpOutput implements IOutputPort {
    public readonly id: string;
    public readonly name: string;
    public readonly manufacturer?: string;
    private readonly _baseUrl: string;
    private readonly _auth: HttpComunicatorAuth;

    public constructor(config: HttpOutputConfig) {
        const base_url = config.baseUrl.trim().replace(/\/$/, "");
        if (!Validators.isUrl(base_url, { allowLocal: true })) {
            throw new Error(`HttpOutput: invalid baseUrl "${config.baseUrl}"`);
        }
        this._baseUrl = base_url;
        this._auth = config.auth;
        this.id = config.id ?? `http-${this._baseUrl}`;
        this.name = config.name ?? this._baseUrl;
        this.manufacturer = "HTTP";
    }

    private _authHeaders(): HeadersInit {
        if (this._auth.type === HttpAuthTypeEnum.Bearer) {
            return { Authorization: `Bearer ${this._auth.token}` };
        }
        return { "X-API-Key": this._auth.key };
    }

    private _request(path: string, body: Record<string, unknown>): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        return fetch(`${this._baseUrl}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this._authHeaders(),
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));
    }

    private _normalizeChannels(options: IOutputPortOptions): number[] {
        const ch = options.channels;
        return Array.isArray(ch) ? ch : [ch];
    }

    sendControlChange(note: number, velocity: number, options: IOutputPortOptions): void {
        const channels = this._normalizeChannels(options);
        this._request("/midi/control-change", { channel: channels.length === 1 ? channels[0] : channels, note, velocity }).then(
            (res) => {
                if (!res.ok) {
                    console.error("[HttpOutput] control-change failed:", res.status, res.statusText);
                }
            },
            (err) => {
                console.error("[HttpOutput] control-change error:", err instanceof Error ? err.message : err);
            }
        );
    }

    sendProgramChange(note: number, options: IOutputPortOptions): void {
        const channels = this._normalizeChannels(options);
        this._request("/midi/program-change", { channel: channels.length === 1 ? channels[0] : channels, note }).then(
            (res) => {
                if (!res.ok) {
                    console.error("[HttpOutput] program-change failed:", res.status, res.statusText);
                }
            },
            (err) => {
                console.error("[HttpOutput] program-change error:", err instanceof Error ? err.message : err);
            }
        );
    }
}
