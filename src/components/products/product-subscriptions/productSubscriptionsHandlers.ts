import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ProductSubscriptionsModel } from "./productSubscriptionsModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";


export class ProductSubscriptionsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "product-subscriptions",
            category: "Products",
            displayName: "Product: Subscriptions",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductSubscriptionsModel()
        };

        return widgetOrder;
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            components:{
                productSubscriptions:{
                    displayName: "Product Subscriptions",
                    plugins:["background", "typography","margin","padding"],
                    components:
                    {
                        subscriptionsGridRow: DefaultStyleDefinitions.GridRow,
                        subscriptionsGridHeader: DefaultStyleDefinitions.GridHeader,
                    }
                }
            }
        };
    }
}