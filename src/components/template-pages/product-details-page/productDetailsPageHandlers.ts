import { IWidgetHandler, IWidgetOrder } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ProductDetailsPageModel } from "./productDetailsPageModel";

export class ProductDetailsPageHandlers implements IWidgetHandler {
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
                            defaults: {
                                typography: {
                                    fontWeight: "normal",
                                    colorKey: "colors/primaryText"
                                },
                            }
                        },
                        subscribeButton: {
                            displayName: "Subscribe button",
                            plugins: ["margin", "padding", "typography", "size", "background", "states", "border"],
                            defaults: {
                                allowedStates: [
                                    "hover",
                                    "focus",
                                    "active",
                                    "disabled"
                                ],

                                typography: {
                                    fontWeight: "normal",
                                    colorKey: "colors/primaryText"
                                },
                                background: {
                                    colorKey: "colors/titleBackgorundColor"
                                },
                                border: {
                                    left: {
                                        width: 2,
                                        style: "solid",
                                        colorKey: "colors/primaryText"
                                    },
                                    right: {
                                        width: 2,
                                        style: "solid",
                                        colorKey: "colors/primaryText"
                                    },
                                    top: {
                                        width: 2,
                                        style: "solid",
                                        colorKey: "colors/primaryText"
                                    },
                                    bottom: {
                                        width: 2,
                                        style: "solid",
                                        colorKey: "colors/primaryText"
                                    }
                                },
                                borderRadius: {
                                    topLeftRadius: 5,
                                    topRightRadius: 5,
                                    bottomLeftRadius: 5,
                                    bottomRightRadius: 5
                                },
                                padding: {
                                    top: 7,
                                    right: 7,
                                    bottom: 7,
                                    left: 7
                                },
                                states: {
                                    hover: {
                                        background: {
                                            colorKey: "colors/primaryText"
                                        },
                                        typography: {
                                            colorKey: "colors/titleBackgorundColor",
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
    }
}