import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { DetailsOfApiModelBinder } from "./detailsOfApiModelBinder";
import { DetailsOfApiViewModelBinder } from "./detailsOfApiViewModelBinder";
import { ApiDetailsViewModel } from "./react/ApiDetailsViewModel";
import { DetailsOfApiModel } from "./detailsOfApiModel";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { IWidgetService } from "@paperbits/common/widgets";


export class DetailsOfApiPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("detailsOfApiModelBinder", DetailsOfApiModelBinder);
        injector.bindSingleton("detailsOfApiViewModelBinder", DetailsOfApiViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("detailsOfApi", {
            modelDefinition: DetailsOfApiModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ApiDetailsViewModel,
            modelBinder: DetailsOfApiModelBinder,
            viewModelBinder: DetailsOfApiViewModelBinder
        });
    }
}