import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ListenForSecretsRequests } from "./listenForSecretsRequests";
import { CustomWidget } from "./ko/runtime/customWidget";

export class CustomWidgetRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("customWidgetScaffoldRuntime", CustomWidget);
        injector.bindToCollection("autostart", ListenForSecretsRequests);
    }
}
