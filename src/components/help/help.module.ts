import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { HelpWorkshop, HelpWorkshopSection } from ".";

export class HelpModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("helpWorkshop", HelpWorkshop);
        injector.bindToCollection("workshopSections", HelpWorkshopSection);
    }
}