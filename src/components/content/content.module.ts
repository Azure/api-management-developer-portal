import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ContentWorkshop } from "./content";
import { OperationsSectionToolButton } from "./operationsSection";
import { ResetDetailsWorkshop } from "./resetDetails";

export class ContentModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("contentWorkshop", ContentWorkshop);
        injector.bind("resetDetailsWorkshop", ResetDetailsWorkshop);
        injector.bindToCollection("workshopSections", OperationsSectionToolButton);
    }
}
