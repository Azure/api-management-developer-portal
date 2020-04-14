import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { OperationDetailsModel } from "./operationDetailsModel";

export class OperationDetailsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "operationDetails",
            category: "Operations",
            displayName: "Operation: details",
            iconClass: "paperbits-cheque-3",
            requires: ["html"],
            createModel: async () => new OperationDetailsModel()
        };

        return widgetOrder;
    }
}