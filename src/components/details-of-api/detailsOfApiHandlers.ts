import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { DetailsOfApiModel } from "./detailsOfApiModel";

export class DetailsOfApiHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "apiDetails",
            displayName: "Details of API",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new DetailsOfApiModel()
        };

        return widgetOrder;
    }
}