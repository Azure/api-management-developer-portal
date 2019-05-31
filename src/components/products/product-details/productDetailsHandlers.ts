import { IWidgetOrder } from '@paperbits/common/editing';
import { IWidgetHandler } from '@paperbits/common/editing';
import { ProductDetailsModel } from './productDetailsModel';

export class ProductDetailsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productDetails",
            displayName: "Product details",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new ProductDetailsModel()
        }

        return widgetOrder;
    }
}