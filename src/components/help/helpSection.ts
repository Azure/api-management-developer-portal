import { ToolButton, ViewManager, View } from "@paperbits/common/ui";

const helpText = "<h1>Help</h1><p>Get help with configuring the developer portal.</p>";

export class HelpSectionToolButton implements ToolButton {
    public readonly iconClass: string = "paperbits-icon paperbits-c-question";
    public readonly title: string = "Help";
    public readonly tooltip: string = helpText;

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