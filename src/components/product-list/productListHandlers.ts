import { IWidgetOrder } from '@paperbits/common/editing';
import { IWidgetHandler } from '@paperbits/common/editing';
import { ProductListModel } from './productListModel';

export class ProductListHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productList",
            displayName: "Product list",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new ProductListModel()
        }

        return widgetOrder;
    }
}