import { ToolButton, ViewManager, View } from "@paperbits/common/ui";

// TODO
const helpText = "<h1>Custom widgets</h1><p>Here you can see all your custom widgets and scaffold new ones.</p><p>To add the custom widget to your page, add it from \"Custom widget\" category from \"Add widget\" list.</p>";

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