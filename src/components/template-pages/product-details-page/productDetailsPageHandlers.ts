import { IWidgetHandler, IWidgetOrder } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ProductDetailsPageModel } from "./productDetailsPageModel";

export class ProductDetailsPageHandlers implements IWidgetHandler{
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productDetailsPage",
            category: "Products",
            displayName: "Product Details Page",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductDetailsPageModel()
        };

        return widgetOrder;
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                titleBackgorundColor: {
                    displayName: "Title background",
                    defaults: {
                        value: "#3F4D50"
                    }
                }
            },
            components: {
                productDetailsPage: {
                    displayName: "Product Details Page",
                    plugins: ["background"],
                    components: {
                        titleBackground: {
                            displayName: "Title background",
                            plugins: ["background"],
                            defaults: {
                                background: {
                                    colorKey: "colors/titleBackgorundColor"
                                }
                            }
                        },
                        titleText: {
                            displayName: "Title text",
                            plugins: ["typography"],
                            defaults:{
                                typography: {
                                    fontWeight: "normal",
                                    colorKey: "colors/primaryText"
                                },
                            }
                        }
                    }
                }
            }
        };
    }
}