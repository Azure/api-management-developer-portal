import { IWidgetHandler } from "@paperbits/common/editing";
import { ChangePasswordModel } from "./changePasswordModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
import { StyleDefinition } from "@paperbits/common/styles";

export class ChangePasswordHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ChangePasswordModel> {
        return new ChangePasswordModel()
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