import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ProductSubscribeModel } from "./productSubscribeModel";

export class ProductSubscribeHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productSubscribe",
            category: "Products",
            displayName: "Product: Subscribe form",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductSubscribeModel()
        };

        return widgetOrder;
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            components: {
                productSubscribe: {
                    displayName: "Product Subscribe",
                    plugins: ["background", "typography", "margin", "padding"],
                    defaults: {
                        typography: {
                            colorKey: "colors/tryItColor"
                        }
                    },
                    components: {
                        subscriptionInput: {
                            displayName: "Input",
                            plugins: ["typography", "background", "border"],
                            defaults: {
                                typography: {
                                    colorKey: "colors/default",
                                    fontStyle: "normal",
                                    fontWeight: "normal",
                                    fontSize: "1rem"
                                },
                                border: {
                                    bottom: {
                                        width: "1px",
                                        style: "solid",
                                        colorKey: "colors/borderColor"
                                    },
                                    top: {
                                        width: "1px",
                                        style: "solid",
                                        colorKey: "colors/borderColor"
                                    },
                                    left: {
                                        width: "1px",
                                        style: "solid",
                                        colorKey: "colors/borderColor"
                                    },
                                    right: {
                                        width: "1px",
                                        style: "solid",
                                        colorKey: "colors/borderColor"
                                    },

                                },
                                padding: {
                                    top: 7,
                                    left: 10,
                                    right: 10,
                                    bottom: 5
                                },
                                margin: {
                                    top: 5,
                                    right: 10,
                                    bottom: 20
                                },
                                size: {
                                    width: "100%"
                                }
                            }
                        },
                        termsOfUseCheckbox: {
                            displayName: "Terms Of Use Checkbox",
                            plugins: ["typography"]
                        },
                        termsOfUseTextarea: {
                            displayName: "Terms Of Use",
                            plugins: ["backround", "typography", "size", "border"]
                        },
                        subscribeButton:{
                            displayName: "Button",
                            plugins:["background","typography","states","shadow","size","margin","border","padding"],
                            defaults:{
                                category:"appearance",
                                appearance: "components/button/default",
                            }
                        }
                    }
                }
            }
        };
    }
}