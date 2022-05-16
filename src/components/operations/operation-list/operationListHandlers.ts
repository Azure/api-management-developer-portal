import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { OperationListModel } from "./operationListModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";

export class OperationListHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "operationList",
            category: "Operations",
            displayName: "List of operations",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new OperationListModel()
        };

        return widgetOrder;
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            components: {
                operationList: {
                    displayName: "Operation List",
                    plugins: ["background", "typography", "margin", "padding"],
                    defaults: {
                        typography: {
                            colorKey: "colors/default"
                        }
                    },
                    components: {
                        searchInput: DefaultStyleDefinitions.SearchInput,
                        tagInput: DefaultStyleDefinitions.TagInput,
                        toggleButtonLabel: DefaultStyleDefinitions.ToggleButtonLabel,
                        widgetText: DefaultStyleDefinitions.WidgetText,
                        tagCard: {
                            displayName: "Tag Card",
                            plugins: ["background", "typography", "padding", "margin", "border"],
                            defaults: {
                                typography: {
                                    colorKey: "colors/tagButtonColor",
                                },
                                border: {
                                    bottom: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    },
                                    top: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    },
                                    left: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    },
                                    right: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    }
                                },
                                margin: {
                                    top: 2,
                                    right: 2,
                                    bottom: 2,
                                    left: 2
                                },
                                padding: {
                                    top: 2,
                                    right: 7,
                                    bottom: 2,
                                    left: 7
                                },
                                size: {
                                    minHeight: "2em"
                                }
                            }
                        },
                        dropdownInput: DefaultStyleDefinitions.DropdownInput,
                        dropdownInputButton: DefaultStyleDefinitions.DropdownInputButton,
                        dropdownContainer: DefaultStyleDefinitions.DropdownContainer
                    }

                }
            }
        };
    }
}