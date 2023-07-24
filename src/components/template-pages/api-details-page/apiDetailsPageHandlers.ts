import { IWidgetHandler, IWidgetOrder } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ApiDetailsPageModel } from "./apiDetailsPageModel";

export class ApiDetailsPageHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "apiDetailsPage",
            category: "APIs",
            displayName: "API Details Page",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ApiDetailsPageModel()
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
                apiDetailsPage: {
                    displayName: "API Details Page",
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
                        highlightSelectedItem: {
                            displayName: "Highlight selected item",
                            plugins: ["border"],
                            defaults: {
                                border: {
                                    left: {
                                        width: 5,
                                        style: "solid",
                                        colorKey: "colors/Bqr2r"
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