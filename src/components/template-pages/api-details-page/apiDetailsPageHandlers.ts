import { IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ApiDetailsPageModel } from "./apiDetailsPageModel";

export class ApiDetailsPageHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ApiDetailsPageModel> {
        return new ApiDetailsPageModel();
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                titleBackgorundColor: {
                    displayName: "Static page title background",
                    defaults: {
                        value: "#155F9C"
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