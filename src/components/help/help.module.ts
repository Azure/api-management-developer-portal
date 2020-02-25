import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { HelpWorkshop, HelpDetailsWorkshop, HelpWorkshopSection } from ".";

export class HelpModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("helpWorkshop", HelpWorkshop);
        injector.bind("helpDetailsWorkshop", HelpDetailsWorkshop);
        injector.bindToCollection("workshopSections", HelpWorkshopSection);
    }
}