import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { DetailsOfApiModel } from "./detailsOfApiModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
import { cloneDeep } from "lodash";


export class DetailsOfApiHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "apiDetails",
            category: "APIs",
            displayName: "API: Details",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new DetailsOfApiModel()
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
                }
            },
            components: {
                apiDetails: {
                    displayName: "API details",
                    plugins: ["background", "typography", "margin", "padding"],
                    components: {
                        apiVersionsCombobox: cloneDeep(DefaultStyleDefinitions.Combobox),
                        apiDefinitionsCombobox: cloneDeep(DefaultStyleDefinitions.Combobox),
                        titleText: {
                            displayName: "Title",
                            plugins: ["typography"]
                        },
                        apiTypeBadge:  cloneDeep(DefaultStyleDefinitions.ApiTypeBadge)
                    }
                }
            }
        };
    }
}