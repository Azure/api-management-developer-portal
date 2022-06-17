import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ChangePasswordModel } from "./changePasswordModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";

export class ChangePasswordHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "change-password",
            category: "User",
            displayName: "Password: Change form",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ChangePasswordModel()
        };

        return widgetOrder;
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            components: {
                changePassword: {
                    displayName: "Change Password",
                    plugins: ["margin", "padding", "background", "typography"],
                    defaults: {
                        typography: {
                            colorKey: "colors/default"
                        }
                    },
                    components: {
                        input: DefaultStyleDefinitions.getInputStyleDefinition(),
                        changeButton: DefaultStyleDefinitions.getButtonStyleDefinition()
                    }
                }
            }
        };
    }
}