import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ProductApisModel } from "./productApisModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions"

export class ProductApisHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "product-apis",
            category: "Products",
            displayName: "Product: APIs",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductApisModel("list")
        };

        return widgetOrder;
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                badgeColor: {
                    displayName: "API type badge color",
                    defaults: {
                        value: "#636363"
                    }
                },
                borderColor: {
                    displayName: "Input border color",
                    defaults: {
                        value: "#505050"
                    }
                },
                gridBorderColor: {
                    displayName: "Grid separators color",
                    defaults: {
                        value: "#dee2e6"
                    }
                }
            },
            components: {
                productApis: {
                    displayName: "Product: APIs",
                    plugins: ["background", "typography", "margin", "padding"],
                    defaults: {
                        typography: {
                            colorKey: "colors/tryItColor"
                        }
                    },
                    components: {
                        tableRow: DefaultStyleDefinitions.getTableRowStyleDefinition(),
                        tableHead: DefaultStyleDefinitions.getTableHeadStyleDefinition(),
                        apiTypeBadge: DefaultStyleDefinitions.getApiTypeBadgeStyleDefinition(),
                        searchInput: DefaultStyleDefinitions.getSearchInputStyleDefinition()
                    }
                }
            }
        };
    }
}

export class ProductApisTilesHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "product-apis-tiles",
            category: "Products",
            displayName: "Product: APIs (tiles)",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProductApisModel("tiles")
        };

        return widgetOrder;
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                badgeColor: {
                    displayName: "API type badge color",
                    defaults: {
                        value: "#636363"
                    }
                },
                borderColor: {
                    displayName: "Input border color",
                    defaults: {
                        value: "#505050"
                    }
                },
            },
            components: {
                productApisTiles: {
                    displayName: "Product: APIs (tiles)",
                    plugins: ["background", "typography", "margin", "padding"],
                    components: {
                        searchInput: DefaultStyleDefinitions.getSearchInputStyleDefinition(),
                        card: DefaultStyleDefinitions.getCardStyleDefinition(),
                        cardTitle: DefaultStyleDefinitions.getCardTitleStyleDefinition(),
                        cardText: DefaultStyleDefinitions.getCardTextStyleDefinition(),
                        widgetText: DefaultStyleDefinitions.getWidgetTextStyleDefinition(),
                        apiTypeBadge: DefaultStyleDefinitions.getApiTypeBadgeStyleDefinition(),
                    }
                }
            }
        };
    }
}