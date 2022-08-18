import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ListenForSecretsRequests } from "./ListenForSecretsRequests";

export class CustomWidgetRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("autostart", ListenForSecretsRequests);
    }
}
