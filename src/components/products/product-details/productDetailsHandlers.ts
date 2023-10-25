import { IWidgetHandler } from "@paperbits/common/editing";
import { ProductDetailsModel } from "./productDetailsModel";
import { StyleDefinition } from "@paperbits/common/styles";

export class ProductDetailsHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ProductDetailsModel> {
        return new ProductDetailsModel()
    }
    public getStyleDefinitions(): StyleDefinition {
        return {
            components: {
                productDetails: {
                    displayName: "Product Details",
                    plugins: ["margin", "padding", "background"],
                    components: {
                        descriptionText: {
                            displayName: "Description Text",
                            plugins: ["typography"],
                            defaults: {
                                typography: {
                                    colorKey: "colors/default",
                                    fonWeight: "normal"
                                }
                            }
                        },
                        titleText: {
                            displayName: "Title Text",
                            plugins: ["typography"],
                            defaults: {
                                typography: {
                                    colorKey: "colors/default",
                                    fonWeight: "normal"
                                }
                            }
                        }
                    }
                }
            }
        };
    }
}