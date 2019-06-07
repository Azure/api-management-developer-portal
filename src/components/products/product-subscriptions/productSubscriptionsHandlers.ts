import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ProductSubscriptionsModel } from "./productSubscriptionsModel";

export class ProductSubscriptionsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "product-subscriptions",
            displayName: "Product: Subscriptions",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new ProductSubscriptionsModel()
        };

        return widgetOrder;
    }
}