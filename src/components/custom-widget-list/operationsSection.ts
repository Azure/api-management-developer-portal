import { ToolButton, ViewManager, View } from "@paperbits/common/ui";

const helpText =
    "<h1>Custom widgets</h1>" +
    "<p>Custom widgets let you extend the developer portal’s functionality in a modular way. For example, you can implement an integration with a support system, reuse it on several pages, and source-control the code in a git repository.</p>";

export class OperationsSectionToolButton implements ToolButton {
    public readonly iconClass: string = "paperbits-icon paperbits-puzzle-10";
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