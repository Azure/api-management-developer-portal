import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ValidationSummaryModel } from "../validation-summary/validationSummaryModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";

export class ValidationSummaryHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "validation-summary",
            category: "User",
            displayName: "Validation summary",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ValidationSummaryModel()
        };

        return widgetOrder;
    }
    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                validationTextColor: {
                    displayName: "Validation Text Color",
                    defaults: {
                        value: "#721c24"
                    }
                },
                validationBackgroundColor: {
                    displayName: "Validation Background Color",
                    defaults: {
                        value: "#f8d7da"
                    }
                },
                validationBorderColor: {
                    displayName: "Validation Border Color",
                    defaults: {
                        value: "#f5c6cb"
                    }
                }
            },
            components: {
                validationSummary: {
                    displayName: "Validation Summary",
                    plugins: ["background", "typography", "margin", "padding"],
                    components: {
                        alertDanger: DefaultStyleDefinitions.getAlertStyleDefinition()
                    }
                }
            }
        };
    }
}