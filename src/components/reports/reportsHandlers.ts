import { IWidgetHandler } from "@paperbits/common/editing";
import { ReportsModel } from "./reportsModel";
import * as DefaultStyleDefinitions from "../defaultStyleDefinitions";
import { StyleDefinition } from "@paperbits/common/styles";


export class ReportsHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ReportsModel> {
        return new ReportsModel()
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