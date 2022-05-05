import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ProductDetailsModel } from "./productDetailsModel";

export class ProductDetailsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productDetails",
            category: "Products",
            displayName: "Product: Details",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductDetailsModel()
        };

        return widgetOrder;
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