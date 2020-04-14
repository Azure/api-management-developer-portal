import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { DetailsOfApiModel } from "./detailsOfApiModel";

export class DetailsOfApiHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "apiDetails",
            category: "APIs",
            displayName: "API: details",
            iconClass: "paperbits-cheque-3",
            requires: ["html"],
            createModel: async () => new DetailsOfApiModel()
        };

        return widgetOrder;
    }
}