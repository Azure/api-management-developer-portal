import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { DetailsOfApiModelBinder } from "../detailsOfApiModelBinder";
import { DetailsOfApiViewModelBinder } from "./detailsOfApiViewModelBinder";
import { DetailsOfApiViewModel } from "./detailsOfApiViewModel";
import { DetailsOfApiModel } from "../detailsOfApiModel";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { IWidgetService } from "@paperbits/common/widgets";


export class DetailsOfApiPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("detailsOfApiModelBinder", DetailsOfApiModelBinder);
        injector.bindSingleton("detailsOfApiViewModelBinder", DetailsOfApiViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("detailsOfApi", {
            modelDefinition: DetailsOfApiModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: DetailsOfApiViewModel,
            modelBinder: DetailsOfApiModelBinder,
            viewModelBinder: DetailsOfApiViewModelBinder
        });
    }
}