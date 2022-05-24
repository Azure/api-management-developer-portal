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
                        searchInput: DefaultStyleDefinitions.getSearchInputStyleDefinition(),
                        tagInput: DefaultStyleDefinitions.getTagInputStyleDefinition(),
                        toggleButtonLabel: DefaultStyleDefinitions.getToggleButtonLabelStyleDefinition(),
                        widgetText: DefaultStyleDefinitions.getWidgetTextStyleDefinition(),
                        tagCard: DefaultStyleDefinitions.getTagCardStyleDefinition(),
                        dropdownInput: DefaultStyleDefinitions.getDropdownInputStyleDefinition(),
                        dropdownInputButton: DefaultStyleDefinitions.getDropdownInputButtonStyleDefinition(),
                        dropdownContainer: DefaultStyleDefinitions.getDropdownContainerStyleDefinition()
                    }

                }
            }
        };
    }
}