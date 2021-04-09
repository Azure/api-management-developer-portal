import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ApiProductsModel } from "./apiProductsModel";

export class ApiProductsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "api-products",
            category: "APIs",
            displayName: "API: products",
            iconClass: "paperbits-cheque-3",
            requires: ["html"],
            createModel: async () => new ApiProductsModel("list")
        };

        return widgetOrder;
    }
}

export class ApiProductsTilesHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "api-products-tiles",
            category: "APIs",
            displayName: "API: products (tiles)",
            iconClass: "paperbits-cheque-3",
            requires: ["html"],
            createModel: async () => new ApiProductsModel("tiles")
        };

        return widgetOrder;
    }
}