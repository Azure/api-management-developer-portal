import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
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
                    displayName: "List of APIs",
                    plugins: ["margin", "padding", "typography"],
                    components: {
                        searchInput: DefaultStyleDefinitions.getSearchInputStyleDefinition(),
                        tableRow: DefaultStyleDefinitions.getTableRowStyleDefinition(),
                        tableHead: DefaultStyleDefinitions.getTableHeadStyleDefinition(),
                        tagInput: DefaultStyleDefinitions.getTagInputStyleDefinition(),
                        toggleButtonLabel: DefaultStyleDefinitions.getToggleButtonLabelStyleDefinition(),
                        tagCard: DefaultStyleDefinitions.getTagCardStyleDefinition(),
                        tagGroupCollapsible: DefaultStyleDefinitions.getIconButtonStyleDefinition(),
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

    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                borderColor: {
                    displayName: "Search input border color",
                    defaults: {
                        value: "#505050"
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
                listOfApisTiles: {
                    displayName: "List of APIs Tiles",
                    plugins: ["margin", "padding", "background", "typography"],
                    components: {
                        searchInput: DefaultStyleDefinitions.getSearchInputStyleDefinition(),
                        apiCard: DefaultStyleDefinitions.getCardStyleDefinition(),
                        cardTitle: DefaultStyleDefinitions.getCardTitleStyleDefinition(),
                        cardText: DefaultStyleDefinitions.getCardTextStyleDefinition(),
                        widgetText: DefaultStyleDefinitions.getWidgetTextStyleDefinition(),
                        tagInput: DefaultStyleDefinitions.getTagInputStyleDefinition(),
                        toggleButtonLabel: DefaultStyleDefinitions.getToggleButtonLabelStyleDefinition(),
                        tagCard: DefaultStyleDefinitions.getTagCardStyleDefinition(),
                        tagGroupCollapsible: DefaultStyleDefinitions.getIconButtonStyleDefinition(),
                    }
                }
            }
        };
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

    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                displayTextColor: {
                    displayName: "Text color",
                    defaults: {
                        value: "#252525"
                    }
                },
                badgeColor: {
                    displayName: "API type badge color",
                    defaults: {
                        value: "#636363"
                    }
                },
                borderColor: {
                    displayName: "Search input border color",
                    defaults: {
                        value: "#505050"
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
                listOfApisDropdown: {
                    displayName: "List of APIs Dropdown",
                    plugins: ["margin", "padding", "typography", "background"],
                    components: {
                        dropdownInput: DefaultStyleDefinitions.getDropdownInputStyleDefinition(),
                        dropdownInputButton: DefaultStyleDefinitions.getDropdownInputButtonStyleDefinition(),
                        dropdownContainer: DefaultStyleDefinitions.getDropdownContainerStyleDefinition(),
                        searchInput: DefaultStyleDefinitions.getSearchInputStyleDefinition(),
                        tagCard: DefaultStyleDefinitions.getTagCardStyleDefinition(),
                        apiTypeBadge: DefaultStyleDefinitions.getApiTypeBadgeStyleDefinition(),
                        widgetText: DefaultStyleDefinitions.getWidgetTextStyleDefinition()
                    }
                }
            }
        };
    }
}