import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { DetailsOfApiModel } from "./detailsOfApiModel";
import { DetailsOfApiModelBinder } from "./detailsOfApiModelBinder";
import { DetailsOfApiViewModel } from "./react/DetailsOfApiViewModel";
import { DetailsOfApiViewModelBinder } from "./detailsOfApiViewModelBinder";

export class DetailsOfApiPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("detailsOfApiModelBinder", DetailsOfApiModelBinder);
        injector.bindSingleton("detailsOfApiViewModelBinder", DetailsOfApiViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("detailsOfApi", {
            modelDefinition: DetailsOfApiModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: DetailsOfApiViewModel,
            modelBinder: DetailsOfApiModelBinder,
            viewModelBinder: DetailsOfApiViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}