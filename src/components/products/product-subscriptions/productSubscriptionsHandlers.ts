import { IWidgetHandler } from "@paperbits/common/editing";
import { ProductSubscriptionsModel } from "./productSubscriptionsModel";


export class ProductSubscriptionsHandlers implements IWidgetHandler<ProductSubscriptionsModel> {
    public async getWidgetModel(): Promise<ProductSubscriptionsModel> {
        return new ProductSubscriptionsModel();
    }
}