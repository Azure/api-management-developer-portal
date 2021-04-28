import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { HistoryOfApiModel } from "./historyOfApiModel";

export class HistoryOfApiHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "apiHistory",
            category: "APIs",
            displayName: "API: Change history",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new HistoryOfApiModel()
        };

        return widgetOrder;
    }
}