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
                    displayName: "List of APIs",
                    plugins: ["margin", "padding", "typography"],
                    components: {
                        searchInput: DefaultStyleDefinitions.SearchInput,
                        apisGridRow: DefaultStyleDefinitions.GridRow,
                        apisGridHeader: DefaultStyleDefinitions.GridHeader,
                        tagInput: DefaultStyleDefinitions.TagInput,
                        toggleButtonLabel: DefaultStyleDefinitions.ToggleButtonLabel
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
            components: {
                listOfApisTiles: {
                    displayName: "List of APIs Tiles",
                    plugins: ["margin", "padding", "background", "typography"],
                    components: {
                        searchInput: DefaultStyleDefinitions.SearchInput,
                        apiCard: DefaultStyleDefinitions.Card,
                        cardTitle: DefaultStyleDefinitions.CardTitle,
                        cardText: DefaultStyleDefinitions.CardText,
                        widgetText: DefaultStyleDefinitions.WidgetText,
                        tagInput: DefaultStyleDefinitions.TagInput,
                        toggleButtonLabel: DefaultStyleDefinitions.ToggleButtonLabel,
                        tagCard: DefaultStyleDefinitions.TagCard
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
                }
            },
            components: {
                listOfApisDropdown: {
                    displayName: "List of APIs Dropdown",
                    plugins: ["margin", "padding", "typography", "background"],
                    components: {
                        dropdownInput: DefaultStyleDefinitions.DropdownInput,
                        dropdownInputButton: DefaultStyleDefinitions.DropdownInputButton,
                        dropdownContainer: DefaultStyleDefinitions.DropdownContainer,
                        searchInput: DefaultStyleDefinitions.SearchInput,
                    }
                }
            }
        };
    }
}