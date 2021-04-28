import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ProductApisModel } from "./productApisModel";

export class ProductApisHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "product-apis",
            category: "Products",
            displayName: "Product: APIs",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductApisModel("list")
        };

        return widgetOrder;
    }
}

export class ProductApisTilesHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "product-apis-tiles",
            category: "Products",
            displayName: "Product: APIs (tiles)",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductApisModel("tiles")
        };

        return widgetOrder;
    }
}