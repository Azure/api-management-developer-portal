import { IWidgetHandler } from "@paperbits/common/editing";
import { ProductListModel } from "./productListModel";

export class ProductListHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ProductListModel> {
        return new ProductListModel("list");
    }
}

export class ProductListDropdownHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ProductListModel> {
        return new ProductListModel("dropdown");
    }
}

export class ProductListTilesHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ProductListModel> {
        return new ProductListModel("tiles");
    }
}