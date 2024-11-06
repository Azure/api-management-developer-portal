import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { DetailsOfApiHandlers } from "./detailsOfApiHandlers";
import { DetailsOfApiModel } from "./detailsOfApiModel";
import { DetailsOfApiModelBinder } from "./detailsOfApiModelBinder";
import { DetailsOfApiEditor } from "./ko/detailsOfApiEditor";
import { DetailsOfApiViewModelBinder } from "./detailsOfApiViewModelBinder";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ApiDetailsViewModel } from "./react/ApiDetailsViewModel";

export class DetailsOfApiDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("detailsOfApiEditor", DetailsOfApiEditor);
        injector.bindSingleton("detailsOfApiModelBinder", DetailsOfApiModelBinder);
        injector.bindSingleton("detailsOfApiViewModelBinder", DetailsOfApiViewModelBinder)
        injector.bindSingleton("detailsOfApiHandlers", DetailsOfApiHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("detailsOfApi", {
            modelDefinition: DetailsOfApiModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ApiDetailsViewModel,
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