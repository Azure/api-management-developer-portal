import { IToolButton, IViewManager, IView } from "@paperbits/common/ui";

export class PublishingWorkshopSection implements IToolButton {
    public iconClass: string = "paperbits-icon paperbits-send";
    public title: string = "Publishing";

    constructor(private readonly viewManager: IViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();

        const view: IView = {
            heading: this.title,
            helpText: "Publish your portal to make the latest version available to visitors.",
            component: { name: "publishing-workshop" }
        };

        this.viewManager.openViewAsWorkshop(view);
    }
}