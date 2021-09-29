import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { BemoNavbarRuntime } from "./ko/runtime/bemo-navbar-runtime";

/**
 * Inversion of control module that registers runtime-time dependencies.
 */
export class BemoNavbarRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("bemoNavbarRuntime", BemoNavbarRuntime);
    }
}