import { IWidgetHandler } from "@paperbits/common/editing";
import { SubscriptionsModel } from "./subscriptionsModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
import { StyleDefinition } from "@paperbits/common/styles";

export class SubscriptionsHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<SubscriptionsModel> {
        return new SubscriptionsModel()
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