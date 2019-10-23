import { ToolButton, ViewManager, View } from "@paperbits/common/ui";

export class HelpWorkshopSection implements ToolButton {
    public iconClass: string = "paperbits-icon paperbits-c-question";
    public title: string = "Help";

    constructor(private readonly viewManager: ViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();

        const view: View = {
            heading: this.title,
            component: { name: "help-workshop" }
        };

        this.viewManager.openViewAsWorkshop(view);
    }
}