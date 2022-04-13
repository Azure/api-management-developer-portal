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
                borderColor: {
                    displayName: "Search input border color",
                    defaults: {
                        value: "#505050"
                    }
                },
                gridBorderColor: {
                    displayName: "Grid separators color",
                    defaults: {
                        value: "#dee2e6"
                    }
                },
                tagButtonColor: {
                    displayName: "Tag button color",
                    defaults: {
                        value: "#555"
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
                                    "focus"
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
                                },
                                states: {
                                    focus: {
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
                                }
                            }
                        },
                        apisGridRow: {
                            displayName: "Grid row",
                            plugins: ["background", "typography", "border"],
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
                                padding: {
                                    top: ".75rem",
                                    bottom: ".75rem"

                                }
                            }
                        },
                        apisGridHeader: {
                            displayName: "Grid row",
                            plugins: ["background", "typography", "border"],
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
                                padding: {
                                    top: ".75rem",
                                    bottom: ".75rem"
                                }
                            }
                        },
                        tagInput: {
                            displayName: "tag input",
                            plugins: ["background", "border", "typography"],
                            defaults: {
                                border: {
                                    bottom: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    },
                                    top: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    },
                                    right: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    },
                                    left: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    }
                                },

                                typography: {
                                    colorKey: "colors/tagButtonColor",
                                    textDecoration: "none"
                                },
                                padding: {
                                    top: 2,
                                    right: 7,
                                    bottom: 2,
                                    left: 7
                                },
                                margin: {
                                    top: 2,
                                    right: 2,
                                    bottom: 2,
                                    left: 2
                                },
                                size: {
                                    minHeight: "2em"
                                },
                                container: {
                                    alignItems: "center"
                                }
                            }
                        },
                        toggleButtonLabel: {
                            displayName: "Label",
                            plugins: ["typography"],
                            defaults: {
                                typography: {
                                    colorKey: "colors/deault"
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