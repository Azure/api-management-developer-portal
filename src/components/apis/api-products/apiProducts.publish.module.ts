import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { ApiProductsModel } from "./apiProductsModel";
import { ApiProductsModelBinder } from "./apiProductsModelBinder";
import { ApiProductsViewModel } from "./react/ApiProductsViewModel";
import { ApiProductsViewModelBinder } from "./apiProductsViewModelBinder";

export class ApiProductsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("apiProductsModelBinder", ApiProductsModelBinder);
        injector.bindSingleton("apiProductsViewModelBinder", ApiProductsViewModelBinder)

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        const apiProductsWidget = {
            modelDefinition: ApiProductsModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ApiProductsViewModel,
            modelBinder: ApiProductsModelBinder,
            viewModelBinder: ApiProductsViewModelBinder,
            componentFlow: ComponentFlow.Block
        };

        widgetService.registerWidget("api-products", apiProductsWidget);
        widgetService.registerWidget("api-products-dropdown", apiProductsWidget);
        widgetService.registerWidget("api-products-tiles", apiProductsWidget);
    }
}