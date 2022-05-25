import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { SubscriptionsModel } from "./subscriptionsModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";

export class SubscriptionsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "userSubscriptions",
            category: "User",
            displayName: "User: Subscriptions",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new SubscriptionsModel()
        };

        return widgetOrder;
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
                userSubscriptions: {
                    displayName: "User: Subscriptions",
                    plugins: ["typography", "background", "margin", "padding"],
                    components: {
                        tableHead: DefaultStyleDefinitions.getTableHeadStyleDefinition(),
                        tableRow: DefaultStyleDefinitions.getTableRowStyleDefinition()
                    }
                }
            }
        };
    }
}