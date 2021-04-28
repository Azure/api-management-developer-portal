import { IWidgetOrder, IWidgetHandler  } from "@paperbits/common/editing";
import { ProductSubscribeModel } from "./productSubscribeModel";

export class ProductSubscribeHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productSubscribe",
            category: "Products",
            displayName: "Product: Subscribe form",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductSubscribeModel()
        };

        return widgetOrder;
    }
}