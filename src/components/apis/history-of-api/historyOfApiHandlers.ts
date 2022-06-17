import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { HistoryOfApiModel } from "./historyOfApiModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";

export class HistoryOfApiHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "apiHistory",
            category: "APIs",
            displayName: "API: Change history",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new HistoryOfApiModel()
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
                }
            },
            components: {
                apiHistory: {
                    displayName: "History Of API",
                    plugins: ["margin", "padding", "background", "typography"],
                    defaults: {
                        typography: {
                            colorKey: "colors/default"
                        }
                    },
                    components: {
                        tableRow: DefaultStyleDefinitions.getTableRowStyleDefinition(),
                        tableHead: DefaultStyleDefinitions.getTableHeadStyleDefinition(),
                        widgetText: DefaultStyleDefinitions.getWidgetTextStyleDefinition()
                    }

                }
            }
        };
    }
}