import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { CustomWidget } from "./ko/runtime/customWidget";
import { ListenForSecretsRequests } from "./listenForSecretsRequests";

export class CustomWidgetRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("customWidgetScaffoldRuntime", CustomWidget);
        injector.bindToCollection("autostart", ListenForSecretsRequests);
    }
}
