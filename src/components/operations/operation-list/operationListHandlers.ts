import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { OperationListModel } from "./operationListModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
import { cloneDeep } from "lodash";

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
                        searchInput: cloneDeep(DefaultStyleDefinitions.SearchInput),
                        tagInput: cloneDeep(DefaultStyleDefinitions.TagInput),
                        toggleButtonLabel: cloneDeep(DefaultStyleDefinitions.ToggleButtonLabel),
                        widgetText: cloneDeep(DefaultStyleDefinitions.WidgetText),
                        tagCard: cloneDeep(DefaultStyleDefinitions.TagCard),
                        dropdownInput: cloneDeep(DefaultStyleDefinitions.DropdownInput),
                        dropdownInputButton: cloneDeep(DefaultStyleDefinitions.DropdownInputButton),
                        dropdownContainer: cloneDeep(DefaultStyleDefinitions.DropdownContainer)
                    }

                }
            }
        };
    }
}