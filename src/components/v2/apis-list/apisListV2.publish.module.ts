import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ApisListV2 } from "./apisListV2";
import { ApisListV2Model } from "./apisListV2Model";
import { ApisListV2ModelBinder } from "./apisListV2ModelBinder";
import { ApisListV2ViewModelBinder } from "./apisListV2ViewModelBinder";

export class ApisListV2PublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("apisListV2", ApisListV2);
        injector.bindSingleton("apisListV2ModelBinders", ApisListV2ModelBinder);
        injector.bindSingleton("apisListV2ViewModelBinders", ApisListV2ViewModelBinder);

        const registry = injector.resolve<IWidgetService>("widgetService");

        registry.registerWidget("apis-list-v2", {
            modelDefinition: ApisListV2Model,
            modelBinder: ApisListV2ModelBinder,
            viewModelBinder: ApisListV2ViewModelBinder,
            componentBinder: ReactComponentBinder,
            componentDefinition: ApisListV2
        });
    }
}