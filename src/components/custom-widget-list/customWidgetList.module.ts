import { ViewManager } from "@paperbits/common/ui";
import { IWidgetService } from "@paperbits/common/widgets";
import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { MapiBlobStorage } from "../../persistence";
import { CustomWidgetHandlers, CustomWidgetModel, CustomWidgetModelBinder, widgetCategory } from "../custom-widget";
import { ContentWorkshop } from "./customWidgetList";
import { OperationsSectionToolButton } from "./operationsSection";
import { CreateWidget } from "./createWidget";
import { loadCustomWidgetConfigs } from "./loadCustomWidgetConfigs";
import { DevelopmentInstructions } from "./developmentInstructions";
import { CopyCode } from "./copyCode";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { CustomWidgetEditorViewModel, CustomWidgetViewModel, CustomWidgetViewModelBinder } from "../custom-widget/ko";

export class CustomWidgetListModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("customWidgetWorkshop", ContentWorkshop);
        injector.bind("createWidgetWorkshop", CreateWidget);
        injector.bind("customWidgetCopyCode", CopyCode);
        injector.bind("customWidgetDevelopmentInstructions", DevelopmentInstructions);
        injector.bindToCollection("workshopSections", OperationsSectionToolButton);

        const blobStorage = injector.resolve<MapiBlobStorage>("blobStorage");
        const viewManager = injector.resolve<ViewManager>("viewManager");
        const configsPromise = loadCustomWidgetConfigs(blobStorage, viewManager);
        injector.bindInstance("customWidgetConfigsPromise", configsPromise);

        const widgetService = injector.resolve<IWidgetService>("widgetService");
        configsPromise.then(configs => configs.forEach(config => {
            widgetService.registerWidget(config.name, {
                modelDefinition: CustomWidgetModel,
                componentBinder: KnockoutComponentBinder,
                componentDefinition: CustomWidgetViewModel,
                modelBinder: CustomWidgetModelBinder,
                viewModelBinder: CustomWidgetViewModelBinder
            });

            widgetService.registerWidgetEditor(config.name, {
                displayName: config.displayName || config.name,
                category: widgetCategory,
                iconClass: "widget-icon widget-icon-component",
                componentBinder: KnockoutComponentBinder,
                componentDefinition: CustomWidgetEditorViewModel,
                handlerComponent: new CustomWidgetHandlers(config)
            });
        }));
    }
}
