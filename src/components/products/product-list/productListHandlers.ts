import { IWidgetHandler } from "@paperbits/common/editing";
import { ProductListModel } from "./productListModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
import { StyleDefinition } from "@paperbits/common/styles";

export class ProductListHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ProductListModel> {
        return new ProductListModel("list");
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
                        searchInput: DefaultStyleDefinitions.getSearchInputStyleDefinition(),
                        tableRow: DefaultStyleDefinitions.getTableRowStyleDefinition(),
                        tableHead: DefaultStyleDefinitions.getTableHeadStyleDefinition()
                    }
                }
            }
        };
    }
}

export class ProductListDropdownHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ProductListModel> {
        return new ProductListModel("dropdown");
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
                        dropdownInput: DefaultStyleDefinitions.getDropdownInputStyleDefinition(),
                        dropdownInputButton: DefaultStyleDefinitions.getDropdownInputButtonStyleDefinition(),
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
                        dropdownSearchInput: DefaultStyleDefinitions.getSearchInputStyleDefinition(),
                        widgetText: DefaultStyleDefinitions.getWidgetTextStyleDefinition()
                    }
                }
            }
        };
    }
}

export class ProductListTilesHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ProductListModel> {
        return new ProductListModel("tiles");
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
                        searchInput: DefaultStyleDefinitions.getSearchInputStyleDefinition(),
                        productCard: DefaultStyleDefinitions.getCardStyleDefinition(),
                        cardTitle: DefaultStyleDefinitions.getCardTitleStyleDefinition(),
                        cardText: DefaultStyleDefinitions.getCardTextStyleDefinition(),
                        widgetText: DefaultStyleDefinitions.getWidgetTextStyleDefinition()
                    }
                }

            }
        };
    }
}