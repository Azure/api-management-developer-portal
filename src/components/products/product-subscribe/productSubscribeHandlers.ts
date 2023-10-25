import { IWidgetHandler } from "@paperbits/common/editing";
import { ProductSubscribeModel } from "./productSubscribeModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
import { StyleDefinition } from "@paperbits/common/styles";

export class ProductSubscribeHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ProductSubscribeModel> {
        return new ProductSubscribeModel()
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                borderColor: {
                    displayName: "Input border color",
                    defaults: {
                        value: "#505050"
                    }
                }
            },
            components: {
                productSubscribe: {
                    displayName: "Product Subscribe",
                    plugins: ["background", "typography", "margin", "padding"],
                    components: {
                        subscriptionInput: DefaultStyleDefinitions.getInputStyleDefinition(),
                        termsOfUseCheckbox: DefaultStyleDefinitions.getTermsOfUseCheckboxDefinition(),
                        termsOfUseTextarea: DefaultStyleDefinitions.getTermsOfUseTextAreaDefinition(),
                        subscribeButton: DefaultStyleDefinitions.getButtonStyleDefinition()
                    }
                }
            }
        };
    }
}