import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { DetailsOfApiHandlers } from "../detailsOfApiHandlers";
import { DetailsOfApiModel } from "../detailsOfApiModel";
import { DetailsOfApiModelBinder } from "../detailsOfApiModelBinder";
import { DetailsOfApiEditor } from "./detailsOfApiEditor";
import { DetailsOfApiViewModel } from "./detailsOfApiViewModel";
import { DetailsOfApiViewModelBinder } from "./detailsOfApiViewModelBinder";

export class DetailsOfApiDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("detailsOfApiEditor", DetailsOfApiViewModel);
        injector.bindSingleton("detailsOfApiModelBinder", DetailsOfApiModelBinder);
        injector.bindSingleton("detailsOfApiViewModelBinder", DetailsOfApiViewModelBinder)
        injector.bindSingleton("detailsOfApiHandlers", DetailsOfApiHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("detailsOfApi", {
            modelDefinition: DetailsOfApiModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: DetailsOfApiViewModel,
            modelBinder: DetailsOfApiModelBinder,
            viewModelBinder: DetailsOfApiViewModelBinder
        });

        widgetService.registerWidgetEditor("detailsOfApi", {
            displayName: "API: Details",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: DetailsOfApiEditor,
            handlerComponent: DetailsOfApiHandlers
        });
    }
}