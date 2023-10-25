import { IWidgetHandler } from "@paperbits/common/editing";
import { OperationListModel } from "./operationListModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
import { StyleDefinition } from "@paperbits/common/styles";

export class OperationListHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<OperationListModel> {
        return new OperationListModel();
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