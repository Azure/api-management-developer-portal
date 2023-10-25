import { IWidgetHandler } from "@paperbits/common/editing";
import { SignupModel } from "./signupModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
import { StyleDefinition } from "@paperbits/common/styles";


export class SignupHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<SignupModel> {
        return new SignupModel()
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            components: {
                signup: {
                    displayName: "Signup",
                    plugins: ["background", "typography", "margin", "padding"],
                    components: {
                        signupButton: DefaultStyleDefinitions.getButtonStyleDefinition(),
                        widgetText: DefaultStyleDefinitions.getWidgetTextStyleDefinition(),
                        input: DefaultStyleDefinitions.getInputStyleDefinition(),
                        termsOfUseTextarea: DefaultStyleDefinitions.getTermsOfUseTextAreaDefinition(),
                        termsOfUseCheckbox: DefaultStyleDefinitions.getTermsOfUseCheckboxDefinition(),
                    }
                }
            }
        };
    }
}