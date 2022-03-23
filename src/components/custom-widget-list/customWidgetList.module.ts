import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ContentWorkshop } from "./customWidgetList";
import { OperationsSectionToolButton } from "./operationsSection";
import { CreateWidget } from "./createWidget";
import loadCustomWidgetConfigs from "./loadCustomWidgetConfigs";
import { CustomWidgetHandlers } from "../custom-widget";

export class CustomWidgetListModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("contentWorkshop", ContentWorkshop);
        injector.bind("resetDetailsWorkshop", CreateWidget);
        injector.bindToCollection("workshopSections", OperationsSectionToolButton);

        const configsPromise = loadCustomWidgetConfigs();
        injector.bindInstance("customWidgetConfigs", configsPromise);
        configsPromise.then(configs => configs.forEach(config =>
            injector.bindInstanceToCollection("widgetHandlers", new CustomWidgetHandlers(config))
        ));
    }
}
