import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ProductApisModel } from "./productApisModel";

export class ProductApisHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "product-apis",
            category: "Products",
            displayName: "Product: APIs",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new ProductApisModel()
        };

        return widgetOrder;
    }
}