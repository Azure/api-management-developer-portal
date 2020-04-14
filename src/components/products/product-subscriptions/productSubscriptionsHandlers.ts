﻿import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ProductSubscriptionsModel } from "./productSubscriptionsModel";

export class ProductSubscriptionsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "product-subscriptions",
            category: "Products",
            displayName: "Product: subscriptions",
            iconClass: "paperbits-cheque-3",
            requires: ["html"],
            createModel: async () => new ProductSubscriptionsModel()
        };

        return widgetOrder;
    }
}