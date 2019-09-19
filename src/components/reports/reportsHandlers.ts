import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ReportsModel } from "./reportsModel";

export class ReportsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "reports",
            category: "Analytics",
            displayName: "Reports",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new ReportsModel()
        };

        return widgetOrder;
    }
}