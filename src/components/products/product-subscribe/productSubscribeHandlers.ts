import { IWidgetHandler } from "@paperbits/common/editing";
import { ProductSubscribeModel } from "./productSubscribeModel";

export class ProductSubscribeHandlers implements IWidgetHandler<ProductSubscribeModel> {
    public async getWidgetModel(): Promise<ProductSubscribeModel> {
        return new ProductSubscribeModel()
    }
}