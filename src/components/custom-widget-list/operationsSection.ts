import { ToolButton, ViewManager, View } from "@paperbits/common/ui";

const helpText =
    "<h1>Custom widgets</h1>" +
    "<p>Custom widgets allow you to extend the developer portal with additional functionality implemented in plain TypeScript, React, or Vue. For example, use custom widgets to integrate the developer portal with your support system. <a href='https://aka.ms/apimdocs/portal/customwidgets' target='_blank'>Learn more</a></p>";

export class OperationsSectionToolButton implements ToolButton {
    public readonly iconClass: string = "paperbits-icon paperbits-paint-bucket-40";
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