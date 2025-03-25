import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { DetailsOfApiEditor } from "./ko/detailsOfApiEditor";
import { DetailsOfApiModel } from "./detailsOfApiModel";
import { DetailsOfApiModelBinder } from "./detailsOfApiModelBinder";
import { DetailsOfApiViewModel } from "./react/DetailsOfApiViewModel";
import { DetailsOfApiViewModelBinder } from "./detailsOfApiViewModelBinder";
import { DetailsOfApiHandlers } from "./detailsOfApiHandlers";

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
            componentDefinition: DetailsOfApiViewModel,
            modelBinder: DetailsOfApiModelBinder,
            viewModelBinder: DetailsOfApiViewModelBinder,
            componentFlow: ComponentFlow.Block
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