import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ContentWorkshop } from "./customWidgetList";
import { OperationsSectionToolButton } from "./operationsSection";
import { CreateWidget } from "./createWidget";

export class CustomWidgetListModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("contentWorkshop", ContentWorkshop);
        injector.bind("resetDetailsWorkshop", CreateWidget);
        injector.bindToCollection("workshopSections", OperationsSectionToolButton);
    }
}
