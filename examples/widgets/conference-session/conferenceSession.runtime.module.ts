import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ConferenceSessionRuntime } from "./ko/runtime/conference-session-runtime";


export class ConferenceSessionRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("conferenceSessionRuntime", ConferenceSessionRuntime);
    }
}