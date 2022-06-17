import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ConfirmPasswordModel } from "./confirmPasswordModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";


export class ConfirmPasswordHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "confirmPassword",
            category: "User",
            displayName: "Password: Confirmation form",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ConfirmPasswordModel()
        };

        return widgetOrder;
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            components: {
                confirmPassword: {
                    displayName: "Confirm Password",
                    plugins: ["margin", "padding", "background"],
                    components: {
                        resetButton: DefaultStyleDefinitions.getButtonStyleDefinition(),
                        widgetText: DefaultStyleDefinitions.getWidgetTextStyleDefinition(),
                        input: DefaultStyleDefinitions.getInputStyleDefinition()
                    }
                }
            }
        };
    }
}