import { ToolButton, ViewManager, View } from "@paperbits/common/ui";

const helpText = "<h1>Operations</h1><p>Publish your portal to make the latest version available to visitors.</p><p>Reset content to roll back to portal's default state.</p>";

export class OperationsSectionToolButton implements ToolButton {
    public readonly iconClass: string = "paperbits-icon paperbits-send";
    public readonly title: string = "Operations";
    public readonly tooltip: string = helpText;

    constructor(private readonly viewManager: ViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();

        const view: View = {
            heading: this.title,
            helpText: helpText,
            component: { name: "content-workshop" }
        };

        this.viewManager.openViewAsWorkshop(view);
    }
}