import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { HistoryOfApiModel } from "./historyOfApiModel";

export class HistoryOfApiHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "apiHistory",
            category: "APIs",
            displayName: "API: history",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new HistoryOfApiModel()
        };

        return widgetOrder;
    }
}