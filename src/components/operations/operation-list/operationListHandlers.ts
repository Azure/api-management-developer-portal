import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { OperationListModel } from "./operationListModel";

export class OperationListHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "operationList",
            category: "Operations",
            displayName: "List of operations",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new OperationListModel()
        };

        return widgetOrder;
    }
}