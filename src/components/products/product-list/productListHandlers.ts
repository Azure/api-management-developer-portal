import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ProductListModel } from "./productListModel";

export class ProductListHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productList",
            category: "Products",
            displayName: "List of products",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductListModel("list")
        };

        return widgetOrder;
    }
}

export class ProductListDropdownHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productListDropdown",
            category: "Products",
            displayName: "List of products (dropdown)",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductListModel("dropdown")
        };

        return widgetOrder;
    }
}

export class ProductListTilesHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productListTiles",
            category: "Products",
            displayName: "List of products (tiles)",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductListModel("tiles")
        };

        return widgetOrder;
    }
}