import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ProductDetailsModel } from "./productDetailsModel";

export class ProductDetailsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productDetails",
            category: "Products",
            displayName: "Product: Details",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductDetailsModel()
        };

        return widgetOrder;
    }
}