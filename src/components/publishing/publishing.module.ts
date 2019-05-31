import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { PublishingWorkshop } from "./publishing";
import { PublishingWorkshopSection } from "./publishingSection";

export class PublishingModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("publishingWorkshop", PublishingWorkshop);
        injector.bindToCollection("workshopSections", PublishingWorkshopSection);
    }
}