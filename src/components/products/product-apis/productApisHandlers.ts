import { IWidgetHandler } from "@paperbits/common/editing";
import { ProductApisModel } from "./productApisModel";

export class ProductApisHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ProductApisModel> {
        return new ProductApisModel("list")
    }
}

export class ProductApisTilesHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ProductApisModel> {
        return new ProductApisModel("tiles")
    }
}