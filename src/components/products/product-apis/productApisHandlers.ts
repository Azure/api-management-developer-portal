import { IWidgetHandler } from "@paperbits/common/editing";
import { ProductApisModel } from "./productApisModel";

export class ProductApisHandlers implements IWidgetHandler<ProductApisModel> {
    public async getWidgetModel(): Promise<ProductApisModel> {
        return new ProductApisModel("list")
    }
}

export class ProductApisTilesHandlers implements IWidgetHandler<ProductApisModel> {
    public async getWidgetModel(): Promise<ProductApisModel> {
        return new ProductApisModel("tiles")
    }
}