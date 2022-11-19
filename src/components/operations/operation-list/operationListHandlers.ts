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
            colors: {
                tagButtonColor: {
                    displayName: "Tag button color",
                    defaults: {
                        value: "#555"
                    }
                }
            },
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
                        searchInput: DefaultStyleDefinitions.getSearchInputStyleDefinition(),
                        tagInput: DefaultStyleDefinitions.getTagInputStyleDefinition(),
                        toggleButtonLabel: DefaultStyleDefinitions.getToggleButtonLabelStyleDefinition(),
                        widgetText: DefaultStyleDefinitions.getWidgetTextStyleDefinition(),
                        tagCard: DefaultStyleDefinitions.getTagCardStyleDefinition(),
                        tagGroupCollapsible: DefaultStyleDefinitions.getIconButtonStyleDefinition(),
                        dropdownInput: DefaultStyleDefinitions.getDropdownInputStyleDefinition(),
                        dropdownInputButton: DefaultStyleDefinitions.getDropdownInputButtonStyleDefinition(),
                        dropdownContainer: DefaultStyleDefinitions.getDropdownContainerStyleDefinition()
                    }

                }
            }
        };
    }
}