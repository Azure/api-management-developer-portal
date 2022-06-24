import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ReportsModel } from "./reportsModel";
import * as DefaultStyleDefinitions from "../defaultStyleDefinitions";

export class ReportsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "reports",
            category: "Analytics",
            displayName: "Reports",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ReportsModel()
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
                reports: {
                    displayName: "Reports",
                    plugins: ["background", "margin", "padding"],
                    components: {
                        button: DefaultStyleDefinitions.getDefaultButtonStyleDefinition(),
                        titleText: DefaultStyleDefinitions.getWidgetTextStyleDefinition(),
                        tablePresetHead: DefaultStyleDefinitions.getTableHeadCellStyleDefinition(),
                        tablePresetRow: DefaultStyleDefinitions.getTableRowCellStyleDefinition(),
                        widgetText: DefaultStyleDefinitions.getWidgetTextStyleDefinition(),
                    }
                }
            }
        };
    }
}