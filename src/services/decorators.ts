/**
 * Class decorators for the services layer.
 *
 * How decorators work (TypeScript):
 * - A class decorator is a function that receives the constructor and can return a new
 *   constructor or mutate the class. It runs once when the class is defined.
 * - Enable in tsconfig: "experimentalDecorators": true
 *
 * @sealed
 * - Calls Object.seal on the constructor and its prototype so no new properties can be
 *   added and the shape is fixed. Used to signal "this class is not intended to be
 *   extended or mutated".
 * - Applied to: AbstractComunicator, Midi, Http, HttpOutput.
 *
 * @Listener
 * - Wraps the class constructor so that when an instance is created, the given
 *   ObjectListener is notified. Useful for debugging (e.g. logging object creation).
 * - Optional: use @Listener(new MyObjectListener()) to log "Object created: ..." in dev.
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export function sealed(constructor: Function): void {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

/** Called when a decorated class instance is created. */
export interface ObjectListener<T> {
    onObjectCreation(instance: T): void;
}

/**
 * Class decorator that notifies the given listener whenever an instance of the class is created.
 * Use for debugging or tracing (e.g. MyObjectListener logs to console).
 */
export function Listener<I extends ObjectListener<unknown>>(listener: I) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function <T extends new (...args: any[]) => any>(constructorFunction: T) {
        const NewConstructor = function (this: InstanceType<T>, ...args: unknown[]) {
            const instance = new constructorFunction(...args) as InstanceType<T>;
            listener.onObjectCreation(instance);
            return instance;
        };
        NewConstructor.prototype = constructorFunction.prototype;
        return NewConstructor as unknown as T;
    };
}

/** Example listener that logs each created instance to the console (for debugging). */
export class MyObjectListener implements ObjectListener<unknown> {
    onObjectCreation(obj: unknown): void {
        console.info("Object created:", typeof obj === "object" && obj !== null ? JSON.stringify(obj) : obj);
    }
}
