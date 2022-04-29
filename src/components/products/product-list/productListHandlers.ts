import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ProductListModel } from "./productListModel";

export class ProductListHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productList",
            category: "Products",
            displayName: "List of products",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductListModel("list")
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
                    displayName: "Grid - border color",
                    defaults: {
                        value: "#dee2e6"
                    }
                }
            },
            components: {
                productList: {
                    displayName: "Product List",
                    plugins: ["margin", "padding", "typography", "background"],
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
                        productsGridRow: {
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
                        productsGridHeader: {
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
                        }
                    }
                }
            }
        };
    }
}

export class ProductListDropdownHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productListDropdown",
            category: "Products",
            displayName: "List of products (dropdown)",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductListModel("dropdown")
        };

        return widgetOrder;
    }
}

export class ProductListTilesHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "productListTiles",
            category: "Products",
            displayName: "List of products (tiles)",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductListModel("tiles")
        };

        return widgetOrder;
    }
}