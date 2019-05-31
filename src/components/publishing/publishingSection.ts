import { IToolButton, IViewManager } from "@paperbits/common/ui";

export class PublishingWorkshopSection implements IToolButton {
    public iconClass: string = "paperbits-icon paperbits-send";
    public title: string = "Publishing";

    constructor(private readonly viewManager: IViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();
        this.viewManager.openViewAsWorkshop(this.title, "publishing-workshop");
    }
}