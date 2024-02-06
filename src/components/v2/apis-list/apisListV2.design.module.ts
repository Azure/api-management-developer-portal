import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ApisListV2 } from "./apisListV2";
import { ApisListV2Editor } from "./apisListV2Editor";
import { ApisListV2Handlers } from "./apisListV2Handlers";
import { ApisListV2Model } from "./apisListV2Model";
import { ApisListV2ModelBinder } from "./apisListV2ModelBinder";
import { ApisListV2ViewModelBinder } from "./apisListV2ViewModelBinder";

export class ApisListV2DesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("apisListV2", ApisListV2);
        injector.bind("apisListV2Editor", ApisListV2Editor);
        injector.bindSingleton("apisListV2ModelBinders", ApisListV2ModelBinder);
        injector.bindSingleton("apisListV2ViewModelBinders", ApisListV2ViewModelBinder);
        injector.bindSingleton("apisListV2Handlers", ApisListV2Handlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("apis-list-v2", {
            componentBinder: ReactComponentBinder,
            componentDefinition: ApisListV2,
            modelBinder: ApisListV2ModelBinder,
            modelDefinition: ApisListV2Model,
            viewModelBinder: ApisListV2ViewModelBinder
        });

        widgetService.registerWidgetEditor("apis-list-v2", {
            displayName: "List of APIs V2",
            category: "APIs",
            componentBinder: ReactComponentBinder,
            componentDefinition: ApisListV2Editor,
            handlerComponent: ApisListV2Handlers,
            iconClass: "widget-icon widget-icon-api-management"
        });
    }
}
