import { IWidgetHandler } from "@paperbits/common/editing";
import { ProductSubscriptionsModel } from "./productSubscriptionsModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
import { StyleDefinition } from "@paperbits/common/styles";


export class ProductSubscriptionsHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ProductSubscriptionsModel> {
        return new ProductSubscriptionsModel();
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                gridBorderColor: {
                    displayName: "Grid separators color",
                    defaults: {
                        value: "#dee2e6"
                    }
                },
            },
            components: {
                productSubscriptions: {
                    displayName: "Product Subscriptions",
                    plugins: ["background", "typography", "margin", "padding"],
                    components:
                    {
                        tableRow: DefaultStyleDefinitions.getTableRowStyleDefinition(),
                        tableHead: DefaultStyleDefinitions.getTableHeadStyleDefinition()
                    }
                }
            }
        };
    }
}