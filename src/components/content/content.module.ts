import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ContentWorkshop } from "./content";
import { ContentWorkshopSection } from "./contentSection";
import { ResetDetailsWorkshop } from "./resetDetails";

export class ContentModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("contentWorkshop", ContentWorkshop);
        injector.bind("resetDetailsWorkshop", ResetDetailsWorkshop);
        injector.bindToCollection("workshopSections", ContentWorkshopSection);
    }
}