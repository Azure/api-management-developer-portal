import { IWidgetHandler } from "@paperbits/common/editing";
import { ConfirmPasswordModel } from "./confirmPasswordModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
import { StyleDefinition } from "@paperbits/common/styles";


export class ConfirmPasswordHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ConfirmPasswordModel> {
        return new ConfirmPasswordModel()
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