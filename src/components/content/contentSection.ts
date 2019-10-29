import { ToolButton, ViewManager, View } from "@paperbits/common/ui";

export class ContentWorkshopSection implements ToolButton {
    public iconClass: string = "paperbits-icon paperbits-send";
    public title: string = "Operations";

    constructor(private readonly viewManager: ViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();

        const view: View = {
            heading: this.title,
            helpText: "<p>Publish your portal to make the latest version available to visitors.</p><p>Reset content to roll back to portal's default state.</p>",
            component: { name: "content-workshop" }
        };

        this.viewManager.openViewAsWorkshop(view);
    }
}