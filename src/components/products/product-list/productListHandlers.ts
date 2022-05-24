﻿import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ProductListModel } from "./productListModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
import { cloneDeep } from "lodash";

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
                    displayName: "Input border color",
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
                        searchInput: cloneDeep(DefaultStyleDefinitions.SearchInput),
                        productsGridRow: cloneDeep(DefaultStyleDefinitions.GridRow),
                        productsGridHeader: cloneDeep(DefaultStyleDefinitions.GridHeader),
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
    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                displayTextColor: {
                    displayName: "Text color",
                    defaults: {
                        value: "#252525"
                    }
                }
            },
            components: {
                productListDropdown: {
                    displayName: "Product List Dropdown",
                    plugins: ["margin", "padding", "typography"],
                    components: {
                        dropdownInput: DefaultStyleDefinitions.DropdownInput,
                        dropdownInputButton: DefaultStyleDefinitions.DropdownInputButton,
                        dropdownContainer: {
                            displayName: "Dropdown",
                            plugins: ["background", "typography"],
                            defaults: {
                                background: {
                                    colorKey: "colors/defaultBg"
                                },
                                padding: {
                                    top: "20px",
                                    right: "20px",
                                    bottom: "20px",
                                    left: "20px",
                                },
                                shadow: {
                                    shadowKey: "shadows/shadow1"
                                }
                            }
                        },
                        dropdownSearchInput: cloneDeep(DefaultStyleDefinitions.SearchInput)
                    }
                }
            }
        };
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

    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                borderColor: {
                    displayName: "Search input border color",
                    defaults: {
                        value: "#505050"
                    }
                }
            },
            components: {
                productListTiles: {
                    displayName: "List of products (tiles)",
                    plugins: ["margin", "padding", "background"],
                    components: {
                        searchInput: cloneDeep(DefaultStyleDefinitions.SearchInput),
                        productCard: cloneDeep(DefaultStyleDefinitions.Card),
                        cardTitle: cloneDeep(DefaultStyleDefinitions.CardTitle),
                        cardText: cloneDeep(DefaultStyleDefinitions.CardText),
                        widgetText: cloneDeep(DefaultStyleDefinitions.WidgetText)
                    }
                }

            }
        };
    }
}