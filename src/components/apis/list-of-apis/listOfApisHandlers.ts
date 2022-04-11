import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ListOfApisModel } from "./listOfApisModel";

export class ListOfApisHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "listOfApis",
            category: "APIs",
            displayName: "List of APIs",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ListOfApisModel("list")
        };

        return widgetOrder;
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                testColor: {
                    displayName: "Pink",
                    defaults: {
                        value: "pink"
                    }
                },
                testColor2: {
                    displayName: "Pink",
                    defaults: {
                        value: "violet"
                    }
                },
                borderColor: {
                    displayName: "Border - light gray",
                    defaults: {
                        value: "#505050"
                    }
                },
                gridBorderColor:{
                    displayName: "Grid - border color",
                    defaults:{
                        value: "#dee2e6"
                    }
                }
            },
            components: {
                listOfApis: {
                    displayName: "listOfApis",
                    plugins: ["margin", "padding", "typography"],
                    components: {
                        searchInput: {
                            displayName: "Search input",
                            plugins: ["typography", "border", "states"],
                            defaults: {
                                allowedStates: [
                                    "hover",
                                    "focus",
                                    "active"
                                ],
                                typography: {
                                    fontSize: "1rem",
                                    colorKey: "colors/default",
                                    lineHeight: "1.5"
                                },

                                border: {
                                    bottom: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/borderColor"
                                    }
                                }
                            }
                        },
                        apisGridRow:{
                            displayName: "Grid row",
                            plugins: ["background", "typography","border"],
                            defaults: {
                                border: {
                                    top: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/gridBorderColor"
                                    }
                                },
                                typography: {
                                    fontWeight: "normal",
                                    colorKey: "colors/default"
                                },
                                display: "flex",
                                padding:{
                                    top: ".75rem",
                                    bottom: ".75rem"
                                   
                                }
                            }
                        },
                        apisGridHeader:{
                            displayName: "Grid row",
                            plugins: ["background", "typography","border"],
                            defaults: {
                                border: {
                                    bottom: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/gridBorderColor"
                                    }
                                },
                                typography: {
                                    fontWeight: "bold",
                                    colorKey: "colors/default"
                                },
                                display: "flex",
                                padding:{
                                    top: ".75rem",
                                    bottom: ".75rem"
                                } 
                            }
                        }
                    }
                }
            }
        };
    }
}
export class ListOfApisTilesHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "listOfApisTiles",
            category: "APIs",
            displayName: "List of APIs (tiles)",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ListOfApisModel("tiles")
        };

        return widgetOrder;
    }
}
export class ListOfApisDropdownHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "listOfApisDropdown",
            category: "APIs",
            displayName: "List of APIs (dropdown)",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ListOfApisModel("dropdown")
        };

        return widgetOrder;
    }
}