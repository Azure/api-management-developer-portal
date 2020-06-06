﻿import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ProductDetailsModel } from "./productDetailsModel";

export class ProductDetailsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productDetails",
            category: "Products",
            displayName: "Product: details",
            iconClass: "paperbits-cheque-3",
            requires: ["html"],
            createModel: async () => new ProductDetailsModel()
        };

        return widgetOrder;
    }
}