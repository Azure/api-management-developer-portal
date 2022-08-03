import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { MarkdownModel } from "./markdownModel";

export class MarkdownHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "markdown",
            displayName: "Markdown",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new MarkdownModel()
        };

        return widgetOrder;
    }
}