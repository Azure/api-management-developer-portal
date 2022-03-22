import { ToolButton, ViewManager, View } from "@paperbits/common/ui";

// TODO
const helpText = "<h1>Custom widgets</h1><p>WiP</p><p>Reset content to roll back to portal's default state.</p>";

export class OperationsSectionToolButton implements ToolButton {
    public readonly iconClass: string = "paperbits-icon paperbits-send";
    public readonly title: string = "Custom widgets";
    public readonly tooltip: string = helpText;

    constructor(private readonly viewManager: ViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();

        const view: View = {
            heading: this.title,
            helpText: helpText,
            component: { name: "custom-widget-list" }
        };

        this.viewManager.openViewAsWorkshop(view);
    }
}