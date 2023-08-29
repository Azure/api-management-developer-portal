import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ApiDetailsPageModelBinder } from "../apiDetailsPageModelBinder";
import { ApiDetailsPageViewModelBinder } from "./apiDetailsPageViewModelBinder";
import { IWidgetService } from "@paperbits/common/widgets";
import { ApiDetailsPageModel } from "../apiDetailsPageModel";
import { ApiDetailsPageViewModel } from "./apiDetailsPageViewModel";
import { ApiDetailsPageEditor } from "./apiDetailsPageEditor";
import { ApiDetailsPageHandlers } from "../apiDetailsPageHandlers";
import { KnockoutComponentBinder } from "@paperbits/core/ko";

export class ApiDetailsPageModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ApiDetailsPageModelBinder);
        injector.bindToCollection("viewModelBinders", ApiDetailsPageViewModelBinder);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("api-details-page", {
            modelDefinition: ApiDetailsPageModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ApiDetailsPageViewModel,
            modelBinder: ApiDetailsPageModelBinder,
            viewModelBinder: ApiDetailsPageViewModelBinder
        });

        widgetService.registerWidgetEditor("api-details-page", {
            displayName: "API Details Page",
            category: "APIs",
            iconClass: "widget-icon widget-icon-api-management",
            componentBinder: KnockoutComponentBinder,
            componentDefinition: ApiDetailsPageEditor,
            handlerComponent: ApiDetailsPageHandlers
        });
    }
}