import { InversifyInjector } from "@paperbits/common/injection";
import { Logger } from "@paperbits/common/logging";

type WrapperType<T> = { new (...args: any[]): T; }

export class WrapperRegisterer {
    /**
     * Registers a wrapper for a given service in the Inversify container.
     * @param injector - The InversifyInjector instance.
     * @param name - The name of the service to register the wrapper for. This service should be already registered in the container.
     * @param wrapper - The wrapper class.
     * @throws Error if the original instance or any of the service parameters are not registered in the container.
     */
    public static registerWrapper<T>(injector: InversifyInjector, name: string, wrapper: WrapperType<T>): void {
        const wrapperArgs = [];

        for (const arg of injector.getFunctionArguments(wrapper)) {
            const argInstance = injector.resolve(arg);
            if (!argInstance) {
                throw new Error(`Instance ${arg} is not registered in the container.`);
            }
            wrapperArgs.push(argInstance);
        }

        const wrapperInstance = new wrapper(...wrapperArgs);
        injector.bindInstance(name, wrapperInstance);
    }
}